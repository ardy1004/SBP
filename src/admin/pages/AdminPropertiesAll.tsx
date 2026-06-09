import { Redirect } from "wouter";

/** Wrapper: /admin/properties/all → redirects to /admin/properties */
export default function AdminPropertiesAll() {
  return <Redirect to="/admin/properties" />;
}
