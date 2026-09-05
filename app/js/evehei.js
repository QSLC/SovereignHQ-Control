// EVE HEI Core Brain — interactive system tree based on the QSLC Sovereign System mind map

var EVE_TREE = [
  { name: 'EVE HEI Core Brain', icon: '\ud83e\udde0', desc: 'Central intelligence orchestrating all sovereign subsystems' },
  { name: 'Technical Architecture', icon: '\u2699\ufe0f', desc: 'Docker, nginx, Cloudflare, static-first deployment' },
  { name: 'Sovereign Data Layer', icon: '\ud83d\udd12', desc: 'Private Supabase database — personal data never leaves your control' },
  { name: 'Financial Operations', icon: '\ud83d\udcb0', desc: 'Stripe billing, time tracking, payroll calculations' },
  { name: 'Conscious Energy Continuum (CEC)', icon: '\u26a1', desc: 'Energy flow tracking and consciousness metrics' },
  { name: 'Deployment & Strategy', icon: '\ud83d\ude80', desc: 'ROG Ally X, Cloudflare Tunnels, corporate roadmap', children: [
    { name: 'Connectivity', icon: '\ud83d\udd17', desc: 'Tunnels and hardware', children: [
      { name: 'ROG Ally X Hardware', icon: '\ud83d\udcbb', desc: 'Portable sovereign compute node' },
      { name: 'Cloudflare Tunnels', icon: '\u2601\ufe0f', desc: 'Secure zero-trust network access' }
    ]},
    { name: 'Corporate Roadmap', icon: '\ud83d\udd9e\ufe0f', desc: 'Timeline and milestones' }
  ]}
];

function loadEveHei() {
  var el = document.getElementById('eveHeiContent');
  if (!el) return;
  el.innerHTML = '<div class="eve-tree">' + renderTreeNode(EVE_TREE, 0) + '</div>';
  // Attach toggle handlers
  el.querySelectorAll('.eve-node-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var children = btn.parentElement.nextElementSibling;
      if (children && children.classList.contains('eve-children')) {
        children.classList.toggle('expanded');
        btn.textContent = children.classList.contains('expanded') ? '\u25BC' : '\u25B6';
      }
    });
  });
}

function renderTreeNode(nodes, depth) {
  var html = '';
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    var hasChildren = node.children && node.children.length > 0;
    html += '<div class="eve-node" style="margin-left:' + (depth * 24) + 'px">' +
      '<div class="eve-node-row">' +
      (hasChildren ? '<button class="eve-node-toggle">\u25B6</button>' : '<span class="eve-node-bullet">\u2022</span>') +
      '<span class="eve-node-icon">' + node.icon + '</span>' +
      '<span class="eve-node-name">' + node.name + '</span>' +
      '</div>' +
      '<div class="eve-node-desc">' + node.desc + '</div>' +
      '</div>';
    if (hasChildren) {
      html += '<div class="eve-children">' + renderTreeNode(node.children, depth + 1) + '</div>';
    }
  }
  return html;
}
