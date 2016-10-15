<img src="https://s13.postimg.org/m5ufoeelz/Logomakr_2_Fx_Qcm.png" alt="VoxJS logo" align="center"/>


[![npm version](https://badge.fury.io/js/voxjs.svg)](https://badge.fury.io/js/voxjs)


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

      Vox.binder.init()
      Vox.validation.init()
      
      
##Html:
  
When bind object it can automatically set convert the value type to int, float, string or currency (formated).

    <input type="text" vox-bind="myObject.name"/>
    
    <textarea vox-bind="myObject.inner.foo"></textarea>
    
    <input type="checkbox" vox-bind="myObject.active" />
    
    <select vox-bind="myObject.option" vox-value-type="int">
        <option value="0">0</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
    </select>
    
    
##Binding table to array

Table changes when use push, pop, or splice the binded array.

HTML:

    <table id="myTable" border="1"></table>


Javascript:

    var myArr = [{
        'name': 'name1',
        'age': 21,
        'inner': {
            'foo': 'bar1'
        }
    }, {
        'name': 'name2',
        'age': 22,
        'inner': {
            'foo': 'bar2'
        }
    } ];
    
    Vox.binder.bindTable(myArr, 'myTable', ['name', 'age', 'inner.foo']);
    
    myArr.push({'name':'test', 'age':20, 'inner':{'foo':'bar_test'}})
    
    
##Validation:

#####vox-required="true" - required
#####vox-pattern="regex" - validation based on regex
#####vox-message="Invalid name" - invalid message

Validation returns 'message' or 'element':

    Vox.validation.validateAll().forEach(function(e) {
            alert(e.message);
     });
      
      
##AJAX (get, post, put, delete):

Returns success, error or then (used for both);

    Vox.ajax.get(URL, DATA).success(function(response){
      console.log(response);
    }).error(function(err) {
      console.log(err);
    });


##Locale

Html - if vox-label is in input, set label as placeholder else set inner value

    <div vox-label="insert_name"></div>
    <label vox-label="insert_name"></label>
    <input type="text" vox-label="insert_name" />

Javascript:

    var ptBr = {
        name: 'pt-br',
        data: {
            'insert_name': 'Insira o nome',
            inner: {
                'insert_text': 'Insira o texto'
            }
        }
    }

    var en = {
        name: 'en',
        data: {
            'insert_name': 'Insert Name',
            inner: {
                'insert_text': 'Insert text'
            }
        }
    }
    
    Vox.locale.setLanguage(en);
    
