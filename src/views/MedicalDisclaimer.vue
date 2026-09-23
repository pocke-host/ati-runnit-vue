<template><LegalPage title="Medical Disclaimer" effective-date="September 23, 2026" intro="Runnit helps people organize training and connect with others. It does not diagnose, treat, prevent, or cure any medical condition." :sections="sections" /></template>
<script setup>
import { useHead } from '@unhead/vue'
import LegalPage from '@/components/LegalPage.vue'
useHead({ title:'Medical Disclaimer — Runnit' })
const sections = [
  { id:'not-medical-care', title:'1. Not medical care', blocks:[{ text:'Runnit, its employees, contractors, coaches, AI features, plans, metrics, recovery scores, recommendations, and content do not provide medical advice or create a clinician-patient relationship. Information is educational and may be incomplete, delayed, or inaccurate.' }]},
  { id:'before-training', title:'2. Before you train', blocks:[{ text:'Consult a qualified healthcare professional before starting or changing an exercise, nutrition, recovery, or weight-management program, especially if you are pregnant, have a medical condition, take medication, have a history of injury, or are returning after inactivity.' }]},
  { id:'stop', title:'3. Stop when something is wrong', blocks:[{ text:'Stop exercising and seek appropriate care for chest pain, fainting, severe shortness of breath, confusion, unusual weakness, serious pain, or any other emergency. Call local emergency services for an emergency. Do not use Runnit for emergency communication.' }]},
  { id:'coaches', title:'4. Coaches and health information', blocks:[{ text:'Coaches on Runnit are independent providers, not Runnit clinicians. Review a coach’s qualifications and ask a healthcare professional whether a recommendation is appropriate for you. Share only the training and health information you choose to share, and report unsafe or misleading advice.' }]}
]
</script>
