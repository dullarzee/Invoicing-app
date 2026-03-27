import { useState } from "react";

//custom disclosure hook
export default function useDisclosure() {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen(!open);

  return {
    open,
    setOpen,
    toggle,
  };
}
