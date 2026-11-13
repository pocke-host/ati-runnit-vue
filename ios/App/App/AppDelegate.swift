import UIKit
import Capacitor
import HealthKit
import Security

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        AppleHealthBackgroundSync.shared.start()
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}

// MARK: - Apple Health background delivery for the Capacitor shell

/// The web layer cannot access HealthKit while Safari is closed. This small
/// native bridge keeps the iOS shell subscribed to new HealthKit workouts and
/// uploads them with the same sample contract used by the web sync flow.
@objc(AppleHealthBackgroundPlugin)
public final class AppleHealthBackgroundPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AppleHealthBackgroundPlugin"
    public let jsName = "AppleHealthBackground"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "configure", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clear", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise)
    ]

    @objc func configure(_ call: CAPPluginCall) {
        guard let token = call.getString("token"),
              let apiBaseURL = call.getString("apiBaseURL"),
              !token.isEmpty,
              !apiBaseURL.isEmpty else {
            call.reject("Apple Health background sync requires an auth token and API URL")
            return
        }

        AppleHealthBackgroundSync.shared.configure(token: token, apiBaseURL: apiBaseURL)
        call.resolve()
    }

    @objc func clear(_ call: CAPPluginCall) {
        AppleHealthBackgroundSync.shared.clearCredentials()
        call.resolve()
    }

    @objc func start(_ call: CAPPluginCall) {
        AppleHealthBackgroundSync.shared.start()
        call.resolve()
    }
}

private final class AppleHealthBackgroundSync {
    static let shared = AppleHealthBackgroundSync()

    private let store = HKHealthStore()
    private let defaults = UserDefaults.standard
    private let tokenKey = "runnit.apple-health.background-token"
    private let keychainService = "live.runnit.apple-health.background"
    private let apiURLKey = "runnit.apple-health.background-api-url"
    private let anchorKey = "runnit.apple-health.background-anchor"
    private var observerQuery: HKObserverQuery?
    private var isSyncing = false

    private init() {}

    func configure(token: String, apiBaseURL: String) {
        saveToken(token)
        defaults.set(apiBaseURL.trimmingCharacters(in: CharacterSet(charactersIn: "/")), forKey: apiURLKey)
        start()
    }

    func clearCredentials() {
        deleteToken()
        defaults.removeObject(forKey: apiURLKey)
        defaults.removeObject(forKey: anchorKey)
        if let observerQuery {
            store.stop(observerQuery)
            self.observerQuery = nil
        }
    }

    func start() {
        guard HKHealthStore.isHealthDataAvailable() else { return }

        if observerQuery == nil {
            let workoutType = HKObjectType.workoutType()
            let query = HKObserverQuery(sampleType: workoutType, predicate: nil) { [weak self] _, completion, error in
                guard let self else {
                    completion()
                    return
                }

                if let error {
                    print("[AppleHealth] observer failed: \(error.localizedDescription)")
                    completion()
                    return
                }

                self.syncNewWorkouts {
                    completion()
                }
            }

            observerQuery = query
            store.execute(query)
        }

        // Re-enable delivery after the user grants Health permissions. The app
        // also calls start() after login/configuration, so a launch-time denial
        // cannot permanently disable automatic sync for this process.
        let workoutType = HKObjectType.workoutType()
        store.enableBackgroundDelivery(for: workoutType, frequency: .hourly) { success, error in
            if let error {
                print("[AppleHealth] background delivery failed: \(error.localizedDescription)")
            } else {
                print("[AppleHealth] background delivery enabled: \(success)")
            }
        }
    }

    private func syncNewWorkouts(completion: @escaping () -> Void) {
        guard !isSyncing,
              let token = loadToken(),
              let apiBaseURL = defaults.string(forKey: apiURLKey),
              let url = URL(string: "\(apiBaseURL)/integrations/apple-health/sync") else {
            completion()
            return
        }

        isSyncing = true
        let anchor = loadAnchor()
        let query = HKAnchoredObjectQuery(
            type: .workoutType(),
            predicate: nil,
            anchor: anchor,
            limit: HKObjectQueryNoLimit
        ) { [weak self] _, samples, _, newAnchor, error in
            guard let self else {
                completion()
                return
            }

            if let error {
                print("[AppleHealth] workout query failed: \(error.localizedDescription)")
                self.isSyncing = false
                completion()
                return
            }

            let workouts = ((samples as? [HKWorkout]) ?? [])
                .reduce(into: [UUID: HKWorkout]()) { result, workout in
                    result[workout.uuid] = workout
                }
                .values
                .map { $0 }
            let body = AppleHealthSyncBody(samples: workouts.map(Self.payload))
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            request.httpBody = try? JSONEncoder().encode(body)

            URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
                defer {
                    self?.isSyncing = false
                    completion()
                }

                if let error {
                    print("[AppleHealth] upload failed: \(error.localizedDescription)")
                    return
                }

                guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
                    let code = (response as? HTTPURLResponse)?.statusCode ?? -1
                    print("[AppleHealth] upload returned HTTP \(code)")
                    return
                }

                if let newAnchor {
                    self?.saveAnchor(newAnchor)
                }
                _ = data
            }.resume()
        }
        store.execute(query)
    }

    private static func payload(_ workout: HKWorkout) -> AppleHealthSamplePayload {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return AppleHealthSamplePayload(
            externalId: workout.uuid.uuidString,
            sportType: sportType(for: workout.workoutActivityType),
            durationSeconds: Int(workout.duration.rounded()),
            distanceMeters: workout.totalDistance.map { Int($0.doubleValue(for: .meter()).rounded()) },
            calories: workout.totalEnergyBurned.map { Int($0.doubleValue(for: .kilocalorie()).rounded()) },
            performedAt: formatter.string(from: workout.startDate)
        )
    }

    private static func sportType(for type: HKWorkoutActivityType) -> String {
        switch type {
        case .running: return "RUN"
        case .cycling: return "RIDE"
        case .swimming: return "SWIM"
        case .hiking: return "HIKE"
        case .walking: return "WALK"
        case .traditionalStrengthTraining, .functionalStrengthTraining: return "STRENGTH"
        default: return "OTHER"
        }
    }

    private func loadAnchor() -> HKQueryAnchor? {
        guard let data = defaults.data(forKey: anchorKey) else { return nil }
        return try? NSKeyedUnarchiver.unarchivedObject(ofClass: HKQueryAnchor.self, from: data)
    }

    private func saveAnchor(_ anchor: HKQueryAnchor) {
        guard let data = try? NSKeyedArchiver.archivedData(withRootObject: anchor, requiringSecureCoding: true) else { return }
        defaults.set(data, forKey: anchorKey)
    }

    private func saveToken(_ token: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: tokenKey,
            kSecValueData as String: Data(token.utf8)
        ]
        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }

    private func loadToken() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: tokenKey,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        var result: AnyObject?
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
              let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    private func deleteToken() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: tokenKey
        ]
        SecItemDelete(query as CFDictionary)
    }
}

private struct AppleHealthSyncBody: Encodable {
    let samples: [AppleHealthSamplePayload]
}

private struct AppleHealthSamplePayload: Encodable {
    let externalId: String
    let sportType: String
    let durationSeconds: Int
    let distanceMeters: Int?
    let calories: Int?
    let performedAt: String
}
