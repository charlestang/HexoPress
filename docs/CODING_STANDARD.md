# Coding Standard 

<!-- @import "[TOC]" {cmd="toc" depthFrom=2 depthTo=6 orderedList=true} -->

<!-- code_chunk_output -->

1. [Use multi-word component names](#use-multi-word-component-names)
2. [Use detailed prop definitions](#use-detailed-prop-definitions)
3. [Use keyed v-for](#use-keyed-v-for)
4. [Avoid `v-if` with `v-for`](#avoid-v-if-with-v-for)
5. [Use component-scoped styling](#use-component-scoped-styling)
6. [Component files](#component-files)
7. [Single-file component filename casing](#single-file-component-filename-casing)
8. [Base component names](#base-component-names)
9. [Tightly coupled component names](#tightly-coupled-component-names)
10. [Order of words in component names](#order-of-words-in-component-names)
11. [Self-closing components](#self-closing-components)
12. [Component name casing in templates](#component-name-casing-in-templates)
13. [Component name casing in JS/JSX](#component-name-casing-in-jsjsx)
14. [Full-word component names](#full-word-component-names)
15. [Prop name casing](#prop-name-casing)
16. [Multi-attribute elements](#multi-attribute-elements)
17. [Simple expressions in templates](#simple-expressions-in-templates)
18. [Simple computed properties](#simple-computed-properties)
19. [Quoted attribute values](#quoted-attribute-values)
20. [Directive shorthands](#directive-shorthands)

<!-- /code_chunk_output -->

## Use multi-word component names

User component names should always be multi-word, except for root App components. This prevents conflicts with existing and future HTML elements, since all HTML elements are a single word.

> BAD

```html
<!-- in pre-compiled templates -->
<Item />

<!-- in in-DOM templates -->
<item></item>
```

> GOOD

```html
<!-- in pre-compiled templates -->
<TodoItem />

<!-- in in-DOM templates -->
<todo-item></todo-item>
```

## Use detailed prop definitions

In committed code, prop definitions should always be as detailed as possible, specifying at least type(s).

> Detailed Explanation
> 
> Detailed prop definitions have two advantages:
>  * They document the API of the component, so that it's easy to see how the component is meant to be used.
>  * In development, Vue will warn you if a component is ever provided incorrectly formatted props, helping you catch potential sources of error.

> Bad

```js
// This is only OK when prototyping
const props = defineProps(['status'])
```

> Good

```js
const props = defineProps({
  status: String
})
```

```js
// Even better!
const props = defineProps({
  status: {
    type: String,
    required: true,

    validator: (value) => {
      return ['syncing', 'synced', 'version-conflict', 'error'].includes(
        value
      )
    }
  }
})
```

## Use keyed v-for

key with v-for is _always_ required on components, in order to maintain internal component state down the subtree. Even for elements though, it's a good practice to maintain predictable behavior, such as object constancy in animations.

> Bad

```html
<ul>
  <li v-for="todo in todos">
    {{ todo.text }}
  </li>
</ul>
```
> Good

```html
<ul>
  <li
    v-for="todo in todos"
    :key="todo.id"
  >
    {{ todo.text }}
  </li>
</ul>
```

## Avoid `v-if` with `v-for`

**Never use `v-if` on the same element as `lv-for`.**

There are two common cases where this can be tempting:

* To filter items in a list (e.g. `v-for="user in users" v-if="user.isActive"`). In these cases, replace `users` with a new computed property that returns your filtered list (e.g. `activeUsers`).

* To avoid rendering a list if it should be hidden (e.g. `v-for="user in users" v-if="shouldShowUsers"`). In these cases, move the `v-if` to a container element (e.g. `ul`, `ol`).

> Bad

```html
<ul>
  <li
    v-for="user in users"
    v-if="user.isActive"
    :key="user.id"
  >
    {{ user.name }}
  </li>
</ul>
```

> Good

```html
<ul>
  <li
    v-for="user in activeUsers"
    :key="user.id"
  >
    {{ user.name }}
  </li>
</ul>
```
```html
<ul>
  <template v-for="user in users" :key="user.id">
    <li v-if="user.isActive">
      {{ user.name }}
    </li>
  </template>
</ul>
```

## Use component-scoped styling

For applications, styles in a top-level `App` component and in layout components may be global, but all other components should always be scoped.

This is only relevant for Single-File Components. It does not require that the scoped attribute be used. Scoping could be through CSS modules, a class-based strategy such as BEM, or another library/convention.

**Component libraries, however, should prefer a class-based strategy instead of using the `scoped` attribute.**

This makes overriding internal styles easier, with human-readable class names that don't have too high specificity, but are still very unlikely to result in a conflict.

> Bad

```html
<template>
  <button class="btn btn-close">×</button>
</template>

<style>
.btn-close {
  background-color: red;
}
</style>
```

> Good

```html
<template>
  <button class="button button-close">×</button>
</template>

<!-- Using the `scoped` attribute -->
<style scoped>
.button {
  border: none;
  border-radius: 2px;
}

.button-close {
  background-color: red;
}
</style>
```

```html
<template>
  <button :class="[$style.button, $style.buttonClose]">×</button>
</template>

<!-- Using CSS modules -->
<style module>
.button {
  border: none;
  border-radius: 2px;
}

.buttonClose {
  background-color: red;
}
</style>
```

```html
<template>
  <button class="c-Button c-Button--close">×</button>
</template>

<!-- Using the BEM convention -->
<style>
.c-Button {
  border: none;
  border-radius: 2px;
}

.c-Button--close {
  background-color: red;
}
</style>
```

## Component files

**Whenever a build system is available to concatenate files, each component should be in its own file.**

This helps you to more quickly find a component when you need to edit it or review how to use it.

> Bad

```js
app.component('TodoList', {
  // ...
})

app.component('TodoItem', {
  // ...
})
```

> Good

```text
components/
|- TodoList.js
|- TodoItem.js
```

```text
components/
|- TodoList.vue
|- TodoItem.vue

```

## Single-file component filename casing

**Filenames of Single-File Components should be always PascalCase.**

PascalCase works best with autocompletion in code editors, as it's consistent with how we reference components in JS(X) and templates, wherever possible.

> Bad

```text
components/
|- mycomponent.vue
```

```text
components/
|- myComponent.vue
```

```text
components/
|- my-component.vue
```

> Good

```text
components/
|- MyComponent.vue
```

## Base component names

**Base components (a.k.a. presentational, dumb, or pure components) that apply app-specific styling and conventions should all begin with a specific prefix, such as `Base`, `App`, or `V`.**

> Bad

```text
components/
|- MyButton.vue
|- VueTable.vue
|- Icon.vue
```
> Good

```text
components/
|- BaseButton.vue
|- BaseTable.vue
|- BaseIcon.vue
```

```text
components/
|- AppButton.vue
|- AppTable.vue
|- AppIcon.vue
```

```text
components/
|- VButton.vue
|- VTable.vue
|- VIcon.vue
```

## Tightly coupled component names

**Child components that are tightly coupled with their parent should include the parent component name as a prefix.**

If a component only makes sense in the context of a single parent component, that relationship should be evident in its name. Since editors typically organize files alphabetically, this also keeps these related files next to each other.

> Bad

```text
components/
|- TodoList.vue
|- TodoItem.vue
|- TodoButton.vue
```

```text
components/
|- SearchSidebar.vue
|- NavigationForSearchSidebar.vue
```

> Good

```text
components/
|- TodoList.vue
|- TodoListItem.vue
|- TodoListItemButton.vue
```

```text
components/
|- SearchSidebar.vue
|- SearchSidebarNavigation.vue
```

## Order of words in component names

**Component names should start with the highest-level (often most general) words and end with descriptive modifying words.**

> Bad

```text
components/
|- ClearSearchButton.vue
|- ExcludeFromSearchInput.vue
|- LaunchOnStartupCheckbox.vue
|- RunSearchButton.vue
|- SearchInput.vue
|- TermsCheckbox.vue
```

> Good

```text
components/
|- SearchButtonClear.vue
|- SearchButtonRun.vue
|- SearchInputQuery.vue
|- SearchInputExcludeGlob.vue
|- SettingsCheckboxTerms.vue
|- SettingsCheckboxLaunchOnStartup.vue
```

## Self-closing components

**Components with no content should be self-closing in Single-File Components, string templates, and JSX - but never in in-DOM templates.**

Components that self-close communicate that they not only have no content, but are meant to have no content. It's the difference between a blank page in a book and one labeled "This page intentionally left blank." Your code is also cleaner without the unnecessary closing tag.

Unfortunately, HTML doesn't allow custom elements to be self-closing - only official "void" elements. That's why the strategy is only possible when Vue's template compiler can reach the template before the DOM, then serve the DOM spec-compliant HTML.

> Bad

```html
<!-- In Single-File Components, string templates, and JSX -->
<MyComponent></MyComponent>
```

```html
<!-- In in-DOM templates -->
<my-component/>
```

> Good

```html
<!-- In Single-File Components, string templates, and JSX -->
<MyComponent/>
```

```html
<!-- In in-DOM templates -->
<my-component></my-component>
```

## Component name casing in templates

**In most projects, component names should always be PascalCase in Single-File Components and string templates - but kebab-case in in-DOM templates.**

PascalCase has a few advantages over kebab-case, but in this project, please using kebab-case everywhere is also acceptable.

> Bad

```html
<!-- In Single-File Components and string templates -->
<mycomponent/>
```

```html
<!-- In Single-File Components and string templates -->
<myComponent/>
```

```html
<!-- In in-DOM templates -->
<MyComponent></MyComponent>
```

```html
<!-- In Single-File Components and string templates -->
<MyComponent/>
```

> Good

```html
<!-- Everywhere -->
<my-component></my-component>
```

## Component name casing in JS/JSX

**Component names in JS/JSX should always be PascalCase, though they may be kebab-case inside strings for simpler applications that only use global component registration through app.component.**

> Bad

```js
app.component('myComponent', {
  // ...
})
```
```js
import myComponent from './MyComponent.vue'
```
```js
export default {
  name: 'myComponent'
  // ...
}
```
```js
export default {
  name: 'my-component'
  // ...
}
```

> Good
```js
app.component('MyComponent', {
  // ...
})
```
```js
app.component('my-component', {
  // ...
})
```
```js
import MyComponent from './MyComponent.vue'
```
```js
export default {
  name: 'MyComponent'
  // ...
}
```

## Full-word component names

**Component names should prefer full words over abbreviations.**

The autocompletion in editors make the cost of writing longer names very low, while the clarity they provide is invaluable. Uncommon abbreviations, in particular, should always be avoided.

> Bad

```text
components/
|- SdSettings.vue
|- UProfOpts.vue
```

> Good

```text
components/
|- StudentDashboardSettings.vue
|- UserProfileOptions.vue
```

## Prop name casing

**Prop names should always use camelCase during declaration. When used inside in-DOM templates, props should be kebab-cased. Single-File Components templates and JSX can use either kebab-case or camelCase props. Casing should be consistent - if you choose to use camelCased props, make sure you don't use kebab-cased ones in your application**

> Bad
```js
const props = defineProps({
  'greeting-text': String
})
```

```html
// for in-DOM templates
<welcome-message greetingText="hi"></welcome-message>
```

> Good

```js
const props = defineProps({
  greetingText: String
})
```

```html
// for SFC - please make sure your casing is consistent throughout the project
// you can use either convention but we don't recommend mixing two different casing styles
<WelcomeMessage greeting-text="hi"/>
// or
<WelcomeMessage greetingText="hi"/>
```

```html
// for in-DOM templates
<welcome-message greeting-text="hi"></welcome-message>
```

## Multi-attribute elements

**Elements with multiple attributes should span multiple lines, with one attribute per line.**

In JavaScript, splitting objects with multiple properties over multiple lines is widely considered a good convention, because it's much easier to read. Our templates and JSX deserve the same consideration.

> Bad

```html
<img src="https://vuejs.org/images/logo.png" alt="Vue Logo">
```
```html
<MyComponent foo="a" bar="b" baz="c"/>
```

> Good
```html
<img
  src="https://vuejs.org/images/logo.png"
  alt="Vue Logo"
>
```

```html
<MyComponent
  foo="a"
  bar="b"
  baz="c"
/>
```

## Simple expressions in templates

**Component templates should only include simple expressions, with more complex expressions refactored into computed properties or methods.**

Complex expressions in your templates make them less declarative. We should strive to describe what should appear, not how we're computing that value. Computed properties and methods also allow the code to be reused.

> Bad
```html
{{
  fullName.split(' ').map((word) => {
    return word[0].toUpperCase() + word.slice(1)
  }).join(' ')
}}
```

> Good
```html
<!-- In a template -->
{{ normalizedFullName }}
```
```js
// The complex expression has been moved to a computed property
const normalizedFullName = computed(() =>
  fullName.value
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
)
```

## Simple computed properties

**Complex computed properties should be split into as many simpler properties as possible.**

> Bad
```js
const price = computed(() => {
  const basePrice = manufactureCost.value / (1 - profitMargin.value)
  return basePrice - basePrice * (discountPercent.value || 0)
})
```

> Good
```js
const basePrice = computed(
  () => manufactureCost.value / (1 - profitMargin.value)
)

const discount = computed(
  () => basePrice.value * (discountPercent.value || 0)
)

const finalPrice = computed(() => basePrice.value - discount.value)
```

## Quoted attribute values

**Non-empty HTML attribute values should always be inside quotes (single or double, whichever is not used in JS).**

While attribute values without any spaces are not required to have quotes in HTML, this practice often leads to avoiding spaces, making attribute values less readable.

> Bad
```html
<input type=text>
```

```html
<AppSidebar :style={width:sidebarWidth+'px'}>
```

> Good

```html
<input type="text">
```

```html
<AppSidebar :style="{ width: sidebarWidth + 'px' }">
```

## Directive shorthands

**Directive shorthands (: for v-bind:, @ for v-on: and # for v-slot) should be used always or never.**

> Bad

```html
<input
  v-bind:value="newTodoText"
  :placeholder="newTodoInstructions"
>
```
```html
<input
  v-on:input="onInput"
  @focus="onFocus"
>
```

```html
<template v-slot:header>
  <h1>Here might be a page title</h1>
</template>

<template #footer>
  <p>Here's some contact info</p>
</template>
```

> Good

```html
<input
  :value="newTodoText"
  :placeholder="newTodoInstructions"
>
```

```html
<input
  v-bind:value="newTodoText"
  v-bind:placeholder="newTodoInstructions"
>
```

```html
<input
  @input="onInput"
  @focus="onFocus"
>
```

```html
<input
  v-on:input="onInput"
  v-on:focus="onFocus"
>
```

```html
<template v-slot:header>
  <h1>Here might be a page title</h1>
</template>

<template v-slot:footer>
  <p>Here's some contact info</p>
</template>
```

```html
<template #header>
  <h1>Here might be a page title</h1>
</template>

<template #footer>
  <p>Here's some contact info</p>
</template>
```
