# Vox
Small and simply two way data binding and validator


 Usage
-------------
Javascript:

    var myObject = {
          name: "myname",
          active: true,
          inner: {
              foo: 'bar'
          },
          option: 2
      };

      Vox.bootstrap();
      Vox.binder.init()
      Vox.validation.init()
      
      
Html:
  
Binded, required and error message for validation:

    <input type="text" vox-bind="myObject.name" vox-required="true" vox-message="Invalid name" />

Inner property:

    <textarea vox-bind="myObject.inner.foo"></textarea>

Ceckbox:

    <input type="checkbox" vox-bind="myObject.active" />

Bind with value type (int, float, string):

    <select vox-bind="myObject.option" vox-value-type="int">
        <option value="0">0</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
    </select>
    
    
Calling validation:

    Vox.validation.validateAll(function(invalids) {
          invalids.forEach(function(o) {
              alert(o.message);
          });
      });