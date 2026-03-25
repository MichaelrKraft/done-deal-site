/**
 * Soul system — generates and evolves the agent's AI personality document.
 * The soul document is a readable markdown string stored on the agent row.
 */

/**
 * Generate an initial soul document for a new agent based on their
 * preferences from the onboarding survey.
 */
export function generateInitialSoul(
  agentName: string,
  preferences: Record<string, string>
): string {
  const preferredName = preferences.preferred_name ?? agentName.split(' ')[0]
  const communicationStyle = preferences.communication_style ?? 'balanced'
  const detailLevel = preferences.detail_level ?? 'highlights'
  const priorityFocus = preferences.priority_focus ?? 'deadlines'
  const urgentHandling = preferences.urgent_handling ?? 'immediate'

  return `# Done Deal TC — Soul Document for ${agentName}

## Who I Am
I'm your AI transaction coordinator at Your Castle Real Estate. I handle the
coordination work so you can focus on relationships and closing deals.

## How I Work With ${preferredName}
- Communication style: ${communicationStyle}
- Detail level: ${detailLevel}
- Priority focus: ${priorityFocus}
- Urgency handling: ${urgentHandling}

## What I've Learned About ${preferredName}
(This section grows over time as I learn your patterns)

## My Values
- I never let a deadline slip without warning you first
- I always explain why I'm doing something, not just what
- I celebrate wins — closing a deal is a big moment
- I protect you from compliance risks before they become problems
- I respect your time — if it's not actionable, I don't bother you

## Colorado Expertise
- I know CBS contract deadlines inside and out
- I understand Your Castle's compliance requirements
- I track MEC-based deadlines automatically
- I flag solar, septic, well, and HOA requirements proactively`
}

/**
 * Given an existing soul document and new learnings from a TC run or chat,
 * return an updated soul document with the new insights incorporated.
 * Called periodically (not every run — maybe weekly or on significant events).
 */
export function evolveSoul(
  currentSoul: string,
  learnings: string[]
): string {
  if (learnings.length === 0) return currentSoul

  const learnedSection = '## What I\'ve Learned'
  const newInsights = learnings.map((l) => `- ${l}`).join('\n')

  // Find the "What I've Learned" section and append new insights
  const sectionIndex = currentSoul.indexOf(learnedSection)
  if (sectionIndex === -1) {
    // Section not found — append at end
    return `${currentSoul}\n\n${learnedSection}\n${newInsights}`
  }

  // Find the next section header after "What I've Learned"
  const afterSection = currentSoul.indexOf('\n## ', sectionIndex + learnedSection.length)

  if (afterSection === -1) {
    // No section after — append at end of document
    return `${currentSoul}\n${newInsights}`
  }

  // Insert new learnings before the next section
  const before = currentSoul.slice(0, afterSection)
  const after = currentSoul.slice(afterSection)
  return `${before}\n${newInsights}${after}`
}
