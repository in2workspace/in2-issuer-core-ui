// this template is used for deployment in all environments (LCL, SBX, Dev2 and PRD)

export const environment = {
  production: true,
  // Admin organization identifier (REQUIRED)
  admin_organization_id: window["env"]["admin_organization_id"],
  // System tenant name; included as "Domain" in credential powers
  sys_tenant: window["env"]["sys_tenant"],
  // Keycloak URL (REQUIRED)
  iam_url: window["env"]["iam_url"],
  // Issuer API base URL (REQUIRED)
  server_url: window["env"]["server_url"],
  // Wallet base URL; currently points to PRD (REQUIRED)
  wallet_url: window["env"]["wallet_url"],
  // Wallet base URL for tests (REQUIRED)
  wallet_url_test: window["env"]["wallet_url_test"],
  // Determines whether to show wallet_url_test or not (REQUIRED)
  show_wallet_url_test: window["env"]["show_wallet_url_test"] === "true",
  // Knowledgebase base URL (REQUIRED)
  knowledge_base_url: window["env"]["knowledge_base_url"],
};
