class Treegrid {
    constructor(container) {
        this._container = container;
        this._tbody = this._container.querySelector('tbody');
        this._nodes = [];
        this._sort();
    }

    render() {
        let html = '';
        for (let i = 0; i < this._nodes.length; i++) 
            html += this._renderNode(this._nodes[i]);
        this._tbody.innerHTML = html;
        this._updateEvents();
    }

    collapseNode(id) {
        let node = this._getNode(id);
        node.status = 'collapsed';
        let tr = this._getTr(id);
        let a = tr.querySelector(`a[tag-id="${id}"]`);
        a.innerHTML = '[+]';
        a.classList.replace('expanded', 'collapsed');
        this._hideChildren(node);
    }

    expandNode(id) {
        let node = this._getNode(id);
        node.status = 'expanded';
        let tr = this._getTr(node.id);
        let a = tr.querySelector(`a[tag-id="${id}"]`);
        a.innerHTML = '[-]';
        a.classList.replace('collapsed', 'expanded');
        this._showChildren(node);
    }

    _getNode(id, nodes) {
        if (typeof nodes === 'undefined')
            nodes = this._nodes;
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            if (node.id == id)
                return node
            let result = this._getNode(id, node.children);
            if (result)
                return result;
        }
        return null;
    }

    _hideChildren(node) {
        for (let i = 0; i < node.children.length; i++) {
            let n = node.children[i];
            let tr = this._getTr(n.id);
            tr.style.display = 'none';
            this._hideChildren(n);
        }
    }

    _showChildren(parentNode) {
        for (let i = 0; i < parentNode.children.length; i++) {
            let n = parentNode.children[i];
            let tr = this._getTr(n.id);
            if (this._hasAncestorCollapsed(n))
                tr.style.display = 'none';
            else
                tr.style.display = '';
            this._showChildren(n);
        }
    }

    _hasAncestorCollapsed(node) {
        while (node.parent != null) {
            let parent = this._getNode(node.parent);
            if (parent.status == 'collapsed')
                return true;
            node = parent;
        }
        return false
    }

    _updateEvents() {
        let elems = this._tbody.querySelectorAll('.parent-node');
        for (let index = 0; index < elems.length; index++) {
            let elem = elems[index];
            elem.addEventListener('click', (evt) => {
                evt.preventDefault();
                let a = evt.currentTarget;
                let id = a.getAttribute('tag-id');
                if (a.classList.contains('expanded'))
                    this.collapseNode(id);
                else 
                    this.expandNode(id);
            });
        }
    }

    _renderNode(node) {
        let html ='';
        let tr = this._getTr(node.id);
        let td = tr.querySelector('td');
        let indentEl = document.createElement('span');
        indentEl.innerHTML = '&emsp;&emsp;'.repeat(node.level);
        if (node.children.length > 0) { // if has children
            let a = document.createElement('a');
            a.classList.add('parent-node', 'expanded');
            a.setAttribute('tag-id', node.id);
            a.setAttribute('href', '');
            a.innerHTML = '[-]';
            indentEl.appendChild(a);
        }
        td.insertBefore(indentEl, td.childNodes[0]);
        html += tr.outerHTML;
        for (let i = 0; i < node.children.length; i++) {
            let childNode = node.children[i];
            html += this._renderNode(childNode);
        }
        return html;
    }

    _getTr(id) {
        return this._tbody.querySelector(`tr[id="${id}"]`);
    }

    _getTrList(parentId) {
        return this._tbody.querySelectorAll(`tr[parent_id="${parentId}"]`);
    }

    _sort() {
        this._nodes = this._getNodeList();
    }

    _getNodeList() {
        let trList = this._tbody.querySelectorAll('tr:not([parent_id]), tr[parent_id=""]')
        if (!trList)
            return []
        let nodes = [];
        for (let index = 0; index < trList.length; index++) {
            let tr = trList[index];
            let children = this._getChildren(tr.id, 0);
            let node = {id:tr.id, parent:null, tr:tr, level:0, children: children, status: (children.length == 0) ? '': 'expanded'}
            nodes.push(node);
        }
        return nodes
    }

    _getChildren(parentId, level) {
        let nodes = []
        let trList = this._getTrList(parentId);
        level += 1;
        for (let index = 0; index < trList.length; index++) {
            let tr = trList[index];
            let children = this._getChildren(tr.id, level)
            let node = {id:tr.id, parent: tr.getAttribute('parent_id'), level:level, children: children, status: (children.length == 0) ? '': 'expanded'}
            nodes.push(node);
        }
        return nodes
    }
}

export {Treegrid};