//this template is used for local serving ("ng serve") and testing

export const environment = {
  production: false,
  sys_tenant: "TENANT",
  admin_organization_id: "VATES-000000000",
  iam_url: 'https://keycloak-dev.ssihub.org/realms/in2-issuer',
  server_url: 'http://localhost:8081',
  wallet_url: 'http://localhost:4202',
  wallet_url_test: 'http://localhost:4202',
  show_wallet_url_test: false,
  knowledge_base_url: "https://knowledgebase.dome-marketplace-sbx.org/",
};
