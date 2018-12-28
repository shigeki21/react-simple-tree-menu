export type TreeNodeObject = { [name: string]: TreeNode };

type BaseTreeNode = {
  label: string;
  [name: string]: any;
};

export type TreeNode = BaseTreeNode & {
  index: number;
  nodes?: TreeNodeObject;
};

export type TreeNodeInArray = BaseTreeNode & {
  key: string;
  nodes?: TreeNodeInArray[];
};

type WalkProps = {
  data: TreeNodeObject | TreeNodeInArray[];
  parent?: string;
  level?: number;
  openNodes: string[];
  searchTerm: string;
};

type BranchProps = {
  parent: string;
  level: number;
  openNodes: string[];
  searchTerm: string;
  node: TreeNode | TreeNodeInArray;
  nodeName: string;
  index?: number;
};

export type Item = {
  isOpen: boolean;
  nodes?: TreeNodeObject;
  key: string;
  level: number;
  label: string;
};

const walk = ({ data = {}, parent = '', level = 0, ...props }: WalkProps): Item[] =>
  Array.isArray(data)
    ? (data as TreeNodeInArray[]).reduce(
        (all: Item[], node: TreeNodeInArray, index) => [
          ...all,
          ...generateBranch({
            node,
            nodeName: node.key,
            parent,
            level,
            index,
            ...props,
          }),
        ],
        []
      )
    : Object.entries(data as TreeNodeObject)
        .sort((a, b) => a[1].index - b[1].index)
        .reduce(
          (all: Item[], [nodeName, node]: [string, TreeNode]) => [
            ...all,
            ...generateBranch({
              node,
              nodeName,
              parent,
              level,
              ...props,
            }),
          ],
          []
        );

const matchSearch = (label: string, searchTerm: string) => {
  const processString = (text: string) => text.trim().toLowerCase();
  return processString(label).includes(processString(searchTerm));
};

const generateBranch = ({ node, nodeName, ...props }: BranchProps): Item[] => {
  const { parent, level, openNodes, searchTerm } = props;

  const { nodes, ...nodeProps } = node;
  const key = [parent, nodeName].filter(x => x).join('/');
  const isOpen = !!nodes && (openNodes.includes(key) || !!searchTerm);
  const label = node.label || 'unknown';
  const isVisible = !searchTerm || matchSearch(label, searchTerm);

  const currentItem = {
    ...props,
    ...nodeProps,
    hasNodes: !!nodes,
    isOpen,
    key,
  };
  const data = Array.isArray(nodes)
    ? (nodes as TreeNodeInArray[])
    : (nodes as TreeNodeObject);
  const nextLevelItems = isOpen
    ? walk({ data, ...props, parent: key, level: level + 1 })
    : [];
  return isVisible ? [currentItem, ...nextLevelItems] : nextLevelItems;
};

export default walk;
