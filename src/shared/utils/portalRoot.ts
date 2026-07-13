const PORTAL_ROOT_ID = 'uikit-portal-root';

export function getPortalRoot(): HTMLElement {
  let root = document.getElementById(PORTAL_ROOT_ID);
  if (root) return root;

  root = document.createElement('div');
  root.id = PORTAL_ROOT_ID;
  // Keep portal out of document flow so adding it doesn't change layout.
  // Do NOT enable pointer events on the root itself (use pointer-events: none),
  // panels rendered into the portal should set their own `pointer-events: auto`
  // when opened so they receive clicks without the root blocking underlying
  // content when closed.
  root.style.position = 'fixed';
  root.style.inset = '0';
  root.style.overflow = 'visible';
  root.style.pointerEvents = 'none';
  root.style.transform = 'none';
  root.style.filter = 'none';
  root.style.perspective = 'none';
  root.style.zIndex = '10000';
  document.body.appendChild(root);
  return root;
}