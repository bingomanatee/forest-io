This is an ORM object based on the @wonderlandlabs/forest state management system. It is analogous to Formik; notable
differences are that functionality and validation are distributed to the field objects themselves, and the functionality
and rendering are not bound in the same solution set.

Its based on @wonderlandlabs/forest, the general purpose state system.

## From the bottom up: Forest-io fields

Forest-io forms are based on a series of field definitions. Each field is defined with the following properties:

* **name**: the name of the field
* **value**: the initial value of the field
* **validator**: an optional function to return/throw errors on invalid values
* **data**: an optional object with any other values (title, selector options, etc.)
  that you want to attach to fields; for example, display label, etc.

### Validators in depth

A validator function indicates a value is "valid" by returning a falsy value (undefined, null, etc.); A validator can
indicate falsiness by either throwing an error or returning a string.

Validator functions are passed `(value, fieldLeaf]`.

Validators are optional.

Validators do not BLOCK the change of a fields' value; they only affect the validation indicators (below)
that describe the valid state of the field.

### Fields' values

A fields value is (way way) more data than the actual input value

each fields' value includes the following values:

* **value**: the current fields' value
* **locked**: (boolean) whether the field has been locked
* **show**: (boolean) a UX utility for showing / hiding the form element; true by default
* **form**: (Form) a reference to its parent form
* **$initialValue**: the value of the field when created
* **$isValid**: (boolean) whether any errors have been returned by the validator function; true if no validator function
* **$error**: (var) any error returned/thrown from the validator function; falsy if no validator exists.
* **$errorMessage**: (string | other) attempts to "unpack" the message field of $error if possible.
* **$isLocked**: either the field _or its form_ has been locked.

also, fields' name property is set from the constructor where available. 

Fields have the following actions:

* **update(value)**: set the next field value
* **updateWithEvent(event)**: set the next field value to event.target.value; useful for form / input UX
* **setLocked(boolean)**: selectively locks the field.
* **setShow(boolean)**: updates the show value of the field.

## Form

A form is a collection of fields.

```javascript

const form = new Form('greeks', {
  alpha: {
    value: 1, validator(value) {
      if (typeof value !== 'number') throw new Error('value must be a number');
    }
  },
  beta: {value: 2},
}, (fieldValues) => {
  return axios.post('/my/api', values);
});

```

Form values have the following fields: 

* **fields**: an object containing the name/value pairs for each field
* **$isValid**: (boolean) whether any errors have been returned by the validator function; true if no validator function
* **$error**: (var) any error returned/thrown from the validator function; falsy if no validator exists.
* **$errorMessage**: (string | other) attempts to "unpack" the message field of $error if possible.
* **$isLocked**: if the form has been locked.

### pairing field I/0 with a form: 

The easiest way to adapt UX to a form's fields is to pass through the updateFromEvent action of each field:

```jsx
<input type="text" value={formLeaf.branch('fields.alpha').value.value} 
       onChange={ formLeaf.branch('fields.alpha').do.updateFromEvent} />
```
Its also quite easy to pass the field branch (`myForm.branch('fields.alpha')`) to a component designed to extract
these actions/values in a general pattern. 

```jsx
const BranchInput = ({branch}) => (
      <div> 
        <label>{branch.name}</label>
        <input type="text" value={branch.value.value}
               onChange={ branch.do.updateFromEvent} />
      </div>
)

const MyComponent = ({form}) => (
  <>
    <BranchInput branch={form.branch('fields.alpha')} />
    <BranchInput branch={form.branch('fields.beta')} />
  </>
)

```