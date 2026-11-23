// The legal entity that operates ArabTides (the site and the apps). Must match the D&B record
// letter for letter: Apple and Google compare their enrollment forms with it.
export const COMPANY = {
  legalName: 'MARIBLU LLC',
  street: '1309 Coffeen Avenue STE 1200',
  city: 'Sheridan',
  region: 'WY',
  regionName: 'Wyoming',
  postalCode: '82801',
  country: 'US',
  email: 'hello@arabtides.com',
};

/** One line, in English as registered: "1309 Coffeen Avenue STE 1200, Sheridan, Wyoming 82801, USA" */
export const companyAddress = `${COMPANY.street}, ${COMPANY.city}, ${COMPANY.regionName} ${COMPANY.postalCode}, USA`;
