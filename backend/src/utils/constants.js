const ROLES = {
  TEAM_MEMBER: 'team_member',
  MANAGER: 'manager',
  ADMIN: 'admin'
};

const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.MANAGER]: 2,
  [ROLES.TEAM_MEMBER]: 1
};

const PERMISSIONS = {
  [ROLES.ADMIN]: ['*'],
  [ROLES.MANAGER]: ['view_all_reports', 'manage_team', 'view_dashboard'],
  [ROLES.TEAM_MEMBER]: ['create_reports', 'edit_own_reports', 'view_own_reports']
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS
};