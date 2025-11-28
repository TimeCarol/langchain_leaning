/**
 * 判断元素在窗口内是否可见
 * @param {HTMLElement} element 要检查的DOM元素
 * @return {boolean} 元素是否可见
 */
function isElementVisible(element) {
    //元素不存在的情况
    if (!element || !(element instanceof HTMLElement)) return false;
    //检查样式
    const style = window.getComputedStyle(element)
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    //获取元素边界
    const rect = element.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return false;
    //获取窗口尺寸
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    //元素边都在视口内
    return rect.top >= 0 && rect.left >= 0 && rect.bottom <= windowHeight && rect.right <= windowWidth;
}

/**
 * 识别并返回DOM元素的交互类型
 * @param {HTMLElement} element 需要判断类型的DOM元素
 * @return {string} 元素的类型描述, 可能的返回值 ['button', 'link', 'dropdown', 'checkbox', 'radio', 'input-text', 'textarea', 'file', 'image', 'text', 'unknown']
 */
function getElementType(element) {
    if (!element || !(element instanceof HTMLElement)) return 'unknown';
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    const eleType = element.getAttribute('type')?.toLowerCase();
    //先检查是否可以编辑
    if (element.isContentEditable) return 'input-text';
    //基于标签名判断
    if (tagName === 'input' && ['button', 'submit', 'reset', 'image'].includes(eleType)) return 'button';
    if (tagName === 'input' && eleType === 'checkbox') return 'checkbox';
    if (tagName === 'input' && eleType === 'radio') return 'radio';
    if (tagName === 'input' && eleType === 'file') return 'file';
    if (tagName === 'input' && eleType === 'hidden') return 'hidden-input';
    //这里可能是 text, password, email, search, number, tel, url...
    if (tagName === 'input') return 'input-text';
    if (tagName === 'textarea') return 'textarea';
    if (tagName === 'select') return 'dropdown';
    if (tagName === 'button') return 'button';
    //存在href属性的a标签才是链接
    if (tagName === 'a' && element.hasAttribute('href')) return 'link';
    //有时a标签当按钮使
    if (tagName === 'a' && role === 'button') return 'button';
    //默认为普通文本容器
    if (tagName === 'a') return 'text';
    if (tagName === 'img') return 'image';
    if (tagName === 'option') return 'dropdown-option';
    if (tagName === 'label') return 'label';
    //处理非标准标签
    if (role === 'button') return 'button';
    if (role === 'link') return 'link';
    if (role === 'checkbox' || role === 'switch') return 'checkbox';
    if (role === 'radio') return 'radio';
    if (role === 'textbox' || role === 'searchbox') return 'input-text';
    if (role === 'listbox' || role === 'combobox' || role === 'menu') return 'dropdown';
    if (role === 'img') return 'image';
    //只是普通容器
    return 'generic-container';
}

/**
 * 获取指定DOM元素的所有属性
 * @param {HTMLElement} element 需要获取属性的DOM对象
 * @return {Object<string, string>} 属性键值对象
 */
function getElementAttributes(element) {
    if (!element || !(element instanceof HTMLElement)) return {};
    const result = {};
    for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        result[attr.name] = attr.value;
    }
    return result;
}

/**
 * 生成指定元素的CSS选择器
 * @param {HTMLElement} element 需要生成选择器的DOM元素
 * @param {Document|Element} root 生成选择器时参考的根节点
 */
function getUniqueSelector(element, root = document) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return '';
    //如果有id并且唯一则使用id
    if (element.id) {
        const id = element.id.trim();
        if (id) {
            const selectorById = `#${window.CSS.escape(id)}`;
            const scope = root || document;
            const matched = scope.querySelectorAll(selectorById);
            //仅找到一个并且就是目标元素
            if (matched.length === 1 && matched[0] === element) return selectorById;
        }
    }
    const segments = [];
    let current = element;
    //逐级向上构建
    while (current && current.nodeType === Node.ELEMENT_NODE && current !== root) {
        let segment = current.tagName.toLowerCase();
        //如果有id则加入id
        if (current.id) {
            const id = element.id.trim();
            if (id) {
                segment += `#${window.CSS.escape(id)}`;
                segments.unshift(segment);
                const scope = root || document;
                const matched = scope.querySelectorAll(segments.join(' > '));
                if (matched.length === 1 && matched[0] === element) return segments.join(' > ');
                //不唯一, 继续向上构建路径
                current = current.parentElement;
                continue;
            }
        }
        //没有id, 使用 class
        if (current.classList && current.classList.length > 0) {
            segment += Array.from(current.classList).map(cls => `.${window.CSS.escape(cls)}`).join('');
        }
        //同一父节点下有多个相同标签的元素, 使用 :nth-of-type 标记位置
        if (current.parentElement) {
            const sameTagSiblings = Array.from(current.parentElement.children).filter(node => node.tagName === current.tagName);
            if (sameTagSiblings && sameTagSiblings.length > 1) {
                const index = sameTagSiblings.indexOf(current) + 1; //从1开始
                segment += `:nth-of-type(${index})`;
            }
        }
        //添加选择器, 放在数组首位
        segments.unshift(segment);
        //检查当前选择器是否可以定位元素
        const scope = root || document;
        const matched = scope.querySelectorAll(segments.join(' > '));
        if (matched.length === 1 && matched[0] === element) return segments.join(' > ');
        //还无法定位, 继续向上构建
        current = current.parentElement;
    }
    //使用路径
    if (segments.length > 0) return segments.join(' > ');
    //返回标签名
    return element.tagName ? element.tagName.toLowerCase() : '';
}

