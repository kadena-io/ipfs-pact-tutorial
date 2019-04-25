import { createIpfsInbox } from "./PactModuleWrappers/IPFSinbox";

const signingTest = () => {
  createIpfsInbox("test003", "A34D324B", "");

  return "json_body";
};
export default signingTest;
