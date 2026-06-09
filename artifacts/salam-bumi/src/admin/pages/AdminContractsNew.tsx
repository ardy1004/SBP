import { useEffect } from "react";
import { useLocation } from "wouter";

/** Wrapper: /admin/contracts/new → redirects to /admin/contracts with new contract action */
export default function AdminContractsNew() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    // Redirect to contracts page — the contract generator will be triggered there
    setLocation("/admin/contracts");
  }, [setLocation]);
  return null;
}
