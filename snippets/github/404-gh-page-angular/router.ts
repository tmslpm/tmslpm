export const IS_GH_404 = document.body.getAttribute("data-page-type") === "404";

export const ROUTES: Route[] = [  
  // ...(IS_GH_404 ? [{ path: "**", redirectTo: "error" }] : [])

  { path: "index.html", redirectTo: "" },
  { component: HomeComponent, path: "", pathMatch: "full", canActivate: [Error404RedirectGuard] },
 
  { component: ErrorComponent, path: "error" },
  { component: ErrorComponent, path: "**" }
]
