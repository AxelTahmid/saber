const treeByParent = (nodes, parentId) => {
	return nodes
		.filter((node) => node.parent_id === parentId)
		.reduce(
			(tree, node) => [
				// biome-ignore lint/performance/noAccumulatingSpread: <explanation>
				...tree,
				{
					...node,
					children: treeByParent(nodes, node.id),
				},
			],
			[]
		);
};

/**
 * * Create recursive tree
 */
const treeFromList = (nodes) => {
	const productMap = new Map();

	nodes.forEach((item) => {
		productMap.set(item.id, { ...item, children: [] });
	});

	nodes.forEach((item) => {
		if (item.parent_id) {
			const parentItem = productMap.get(item.parent_id);

			if (parentItem) {
				parentItem.children.push(item);
			}
		}
	});

	const rootNodes = [...productMap.values()].filter((item) => !item.parent_id);
	return rootNodes;
};

function topLevel(data) {
	return data.filter((node) => !node.parent_id);
}

function traverse(data, parentId) {
	const children = data.filter((each) => each.parent_id === parentId);
	children.forEach((child) => {
		child.children = traverse(data, child.id);
	});
	return children;
}

function structuredTree(data) {
	return topLevel(data).map((each) => {
		each.children = traverse(data, each.id);
		return each;
	});
}

export default {
	structuredTree,
	treeFromList,
	treeByParent,
};
