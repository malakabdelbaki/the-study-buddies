
"use client"; //marker: client-side

import { getCookie } from "cookies-next";
import { useState } from "react";

export default function MePage() {
  const [cookieClient] = useState(
    getCookie("cookieClient")?.toString() ?? ""
  );


  return (
    <>
      <h1>Hi from meeeeeeeeeeeeeeee cookies is extract from @cookies-next@ which is client side</h1>
      <p>{cookieClient}</p>
    </>
  );
}
