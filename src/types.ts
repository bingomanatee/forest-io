export type FieldDef = {
  name?: string;
  value?: any;
  validator?: (value, target?) => any;
  options?: { optional: boolean | null };
};
export type FieldValue = {
  name: string;
  value: any;
  $isValid: boolean;
  $error: any;
};

type SendUrlObject = { [key: string]: string };
export type RestOptions = {
  url?: string;
  urls?: SendUrlObject;
  send?: (action: string, data: any) => Promise<any>;
  identityName?: string;
  serialize?: (collection, fields, identity, context) => any;
};
