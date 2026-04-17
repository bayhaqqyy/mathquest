const STORAGE_KEY = 'mathquest_skill_progress'

export function getSkillProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function markSkillCompleted(topicId, skillId) {
  if (!topicId || !skillId) return

  const progress = getSkillProgress()
  const completed = new Set(progress[topicId]?.completed || [])
  completed.add(skillId)

  progress[topicId] = {
    ...progress[topicId],
    completed: Array.from(completed),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function applySkillProgress(tree, topicId) {
  const completed = new Set(getSkillProgress()[topicId]?.completed || [])

  return {
    ...tree,
    skills: tree.skills.map(skill => {
      if (completed.has(skill.id)) {
        return { ...skill, status: 'completed' }
      }

      const prerequisiteCompleted = tree.skills.some(parent =>
        completed.has(parent.id) && parent.connections.includes(skill.id)
      )

      if (skill.status === 'active' || prerequisiteCompleted) {
        return { ...skill, status: 'active' }
      }

      return { ...skill, status: 'locked' }
    }),
  }
}
