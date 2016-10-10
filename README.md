<img src="https://s13.postimg.org/m5ufoeelz/Logomakr_2_Fx_Qcm.png" alt="VoxJS logo" align="center"/>


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
      
      
##Html:
  
Binded, required and error message for validation:

    <input type="text" vox-bind="myObject.name" vox-required="true" vox-message="Invalid name" />

###Inner property:

    <textarea vox-bind="myObject.inner.foo"></textarea>

###Ceckbox:

    <input type="checkbox" vox-bind="myObject.active" />

###Bind with value type (int, float, string):

    <select vox-bind="myObject.option" vox-value-type="int">
        <option value="0">0</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
    </select>
    
    
###Bind table

Table update when insert item to array:

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
    
    
###Calling validation:

    Vox.validation.validateAll(function(invalids) {
          invalids.forEach(function(o) {
              alert(o.message);
          });
      });
      
      
##AJAX (get, post, put, delete):

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
    
