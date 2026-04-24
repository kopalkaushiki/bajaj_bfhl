const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Validate edge
function isValid(edge) {
  const e = edge.trim();
  return /^[A-Z]->[A-Z]$/.test(e) && e[0] !== e[3];
}

app.post("/bfhl", (req, res) => {
  const data = req.body.data || [];

  let valid = [];
  let invalid = [];
  let seen = new Set();
  let duplicates = new Set();

  // Step 1: Validate + duplicates
  for (let edge of data) {
    let e = edge.trim();

    if (!isValid(e)) {
      invalid.push(edge);
      continue;
    }

    if (seen.has(e)) {
      duplicates.add(e);
      continue;
    }

    seen.add(e);
    valid.push(e);
  }

  // Step 2: Build graph
  let graph = {};
  let childSet = new Set();
  let allNodes = new Set();

  for (let e of valid) {
    let [p, c] = e.split("->");

    if (!graph[p]) graph[p] = [];
    graph[p].push(c);

    childSet.add(c);
    allNodes.add(p);
    allNodes.add(c);
  }

  // Step 3: Find roots
  let roots = [...allNodes].filter(n => !childSet.has(n));

  let hierarchies = [];
  let totalTrees = 0;
  let totalCycles = 0;
  let maxDepth = 0;
  let largestRoot = "";

  let processed = new Set();

  function dfs(node, visited) {
    if (visited.has(node)) return { cycle: true };

    visited.add(node);

    let tree = {};
    let depth = 1;

    if (graph[node]) {
      let maxChild = 0;

      for (let child of graph[node]) {
        let res = dfs(child, new Set(visited));
        if (res.cycle) return { cycle: true };

        tree[child] = res.tree;
        maxChild = Math.max(maxChild, res.depth);
      }

      depth += maxChild;
    }

    return { tree, depth };
  }

  // Step 4: Process normal trees
  for (let root of roots) {
    let res = dfs(root, new Set());

    if (res.cycle) {
      hierarchies.push({
        root,
        tree: {},
        has_cycle: true
      });
      totalCycles++;
    } else {
      hierarchies.push({
        root,
        tree: { [root]: res.tree },
        depth: res.depth
      });
      totalTrees++;

      if (
        res.depth > maxDepth ||
        (res.depth === maxDepth && (largestRoot === "" || root < largestRoot))
      ) {
        maxDepth = res.depth;
        largestRoot = root;
      }
    }

    processed.add(root);
  }

  // Step 5: Handle cycles (nodes without roots)
  for (let node of allNodes) {
    if (processed.has(node)) continue;

    let res = dfs(node, new Set());

    if (res.cycle) {
      hierarchies.push({
        root: node,
        tree: {},
        has_cycle: true
      });
      totalCycles++;
    }

    processed.add(node);
  }

  res.json({
    user_id: "kopalkaushiki", 
    email_id: "kopalkaushiki5@gmail.com", 
    college_roll_number: "RA2311033010162",  
    
    hierarchies,
    invalid_entries: invalid,
    duplicate_edges: [...duplicates],
    summary: {
      total_trees: totalTrees,
      total_cycles: totalCycles,
      largest_tree_root: largestRoot
    }
  });
});

app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(3000, () => console.log("Server running on port 3000"));