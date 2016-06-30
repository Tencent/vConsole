Helper Functions
==============================

vConsole provides some useful helper functions for efficient plugin development.

Helper functions are mounted in different vConsole properties according to their usage:

- `vConsole.tool`: Helper functions.
- `vConsole.$`: DOM-related functions.


## vConsole.tool

### vConsole.tool.isString(value)
### vConsole.tool.isArray(value)
### vConsole.tool.isBoolean(value)
### vConsole.tool.isElement(value)
### vConsole.tool.isFunction(value)
### vConsole.tool.isNull(value)
### vConsole.tool.isNumber(value)
### vConsole.tool.isObject(value)
### vConsole.tool.isSymbol(value)
### vConsole.tool.isUndefined(value)

Check whether a value is a certain type.

##### Return:
- Boolean



### vConsole.tool.htmlEncode(text)

Encode a text into a HTML non-sensitive string.

##### Parameters:
- (required) text: A string to be encoded.

##### Return:
- String



### vConsole.tool.setStorage(key, value)

Set data to `localStorage`. A prefix `vConsole_` will be added to `key` automatically.

Note that some devices may not have `localStorage` and then `value` would not be saved under this situation, so DO NOT use this method to save permanent data.

##### Parameters:
- (required) key: A string, the name of data.
- (required) value: A string, the value of data.

##### Return:
- None

##### Example:

```javascript
vConsole.tool.setStorage('count', 1);
```



### vConsole.tool.getStorage(key)

Get data from `localStorage`. A prefix `vConsole_` will be added to `key` automatically.

##### Parameters:
- (required) key: A string, the name of data.

##### Return:
- String, the value of data.

##### Example:

```javascript
var num = vConsole.tool.setStorage('count'); // => 1
```



## vConsole.$

### vConsole.$.one(selectors, baseElement)

Returns the first element within the document or baseElement that matches the specified group of selectors.

##### Parameters:
- (required) selectors: A string containing one or more CSS selectors separated by commas.
- (optional) baseElement: An element object, default to be `document`.

##### Return:
- Element object

##### Example:

```javascript
var $page = vConsole.$.one('#my_page');
var $item = vConsole.$.one('.item', $page);
```


### vConsole.$.all(selectors, baseElement)

Returns a list of elements within the document or baseElement that matches the specified group of selectors.

##### Parameters:
- (required) selectors: A string containing one or more CSS selectors separated by commas.
- (optional) baseElement: An element object, default to be `document`.

##### Return:
- Element object

##### Example:

```javascript
var $page = vConsole.$.one('#my_page');
var $items = vConsole.$.all('.item', $page);
```


### vConsole.$.addClass(elements, className)

Add the specified class(es) to element(s).

##### Parameters:
- (required) elements: A single or a list of element object(s).
- (required) className: A string of one or more space-separated classes.

##### Return:
- None

##### Example:

```javascript
var $items = vConsole.$.all('.item');
vConsole.$.addClass($items, 'selected');
```


### vConsole.$.removeClass(elements, className)

Remove the specified class(es) of element(s).

##### Parameters:
- (required) elements: A single or a list of element object(s).
- (required) className: A string of one or more space-separated classes.

##### Return:
- None

##### Example:

```javascript
var $items = vConsole.$.all('.item');
vConsole.$.removeClass($items, 'selected');
```


### vConsole.$.hasClass(element, className)

Check whether an element is assigned the given class.

##### Parameters:
- (required) element: An element object.
- (required) className: A string.

##### Return:
- Boolean

##### Example:

```javascript
var $page = vConsole.$.one('#my_page');
if (vConsole.$.hasClass($page, 'actived')) {
	// do something
}
```


### vConsole.$.bind(elements, eventType, fn, useCapture)

Bind an event to element(s).

##### Parameters:
- (required) elements: A single or a list of element object(s).
- (required) eventType: A string of event's type.
- (required) fn: A function to execute when the event is triggered.
- (optional) useCapture: A boolean that indicates the event uses capturing or bubbling, default to be `false`.

##### Return:
- None

##### Example:

```javascript
var $btn = vConsole.$.one('#submit');
vConsole.$.bind($btn, 'click', function(event) {
	event.preventDefault();
	alert('submit!');
});
```


### vConsole.$.delegate(element, eventType, selectors, fn)

Bind an event to an element, and only this element's descendants which match the selectors can trigger the event.

##### Parameters:
- (required) element: An element object.
- (required) eventType: A string of event's type.
- (required) selectors: A string containing one or more CSS selectors separated by commas.
- (required) fn: A function to execute when the event is triggered.

##### Return:
- None

##### Example:

```javascript
var $page = vConsole.$.one('#my_page');
vConsole.$.delegate($page, 'click', '.item', function(event) {
	vConsole.$.addClass(this, 'selected'); // this => '.item'
});
```


### vConsole.$.render(tpl, data, toString)

Compile a template into an element object or a HTML string with given data.

##### Parameters:
- (required) tpl: A template string.
- (required) data: A key-value data which is used to render the template.
- (optional) toString: A boolean that indicates whether returns an element object or a HTML string, default to be `false`.

##### Return:
- Element object or HTML string

##### Syntax:

If:
```html
{{if}}
	...
{{else}}
	...
{{/if}}
```

For:
```html
{{for (var i=0; i<10; i++)}}
	...
	{{continue}}
	{{break}}
{{/for}}
```

Switch:
```html
{{switch (flag)}}
	{{case 1}}
		...
		{{break}}
	{{default}}
		...
{{/switch}}
```

Print:
```html
{{flag}}
```

###### Example:

```javascript
var tpl = '<ul>' +
	'{{for (var i = 0; i < list.length; i++)}}' +
		'<li>' + '{{list[i]}}' + '</li>' +
	'{{/for}}' +
'</ul>';
var data = {
	list: ['Red', 'Blue', 'Yellow']	
};

var html = vConsole.$.render(tpl, data, true);
document.body.innerHTML += html;
```

Output:

```html
<ul>
<li>Red</li>
<li>Blue</li>
<li>Yellow</li>
</ul>
```


[Back to Index](./a_doc_index.md)