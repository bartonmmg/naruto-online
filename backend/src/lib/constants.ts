export const XP_ACTIONS = {
  DAILY_LOGIN: 'DAILY_LOGIN',
  GUIDE_READ: 'GUIDE_READ',
  TOOL_USED: 'TOOL_USED',
  COMMUNITY_POST: 'COMMUNITY_POST',
} as const

export type XpAction = (typeof XP_ACTIONS)[keyof typeof XP_ACTIONS]

export const XP_AMOUNTS: Record<XpAction, number> = {
  [XP_ACTIONS.DAILY_LOGIN]: 10,
  [XP_ACTIONS.GUIDE_READ]: 5,
  [XP_ACTIONS.TOOL_USED]: 3,
  [XP_ACTIONS.COMMUNITY_POST]: 15,
}
