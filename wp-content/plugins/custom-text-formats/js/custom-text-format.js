jQuery(document).ready(function($) {

(function (wp) {

    /*
        id = format[0]
        slug = format[1]
        title = format[2]
        icon = format[3]
        tag = format[4]
        class = format[5]
        content-type = format[6]
        block_content = format[7]
    */

    //var formatsArray = jQuery('.testarray').attr('data-array');
    
   //var formatsArray = 'b64711a2246e2b--nytt--nytt--editor-justify----##64711a2246ebf--just-another--Just another--editor-justify--span--red##64711a2246f3e--formatet--formatet--editor-justify--span--green';
    
    console.log(formatsArray);

    var textFormat = [];

   // formatsArray = formatsArray.split('##');
  

    // Define a helper function to create the textFormat functions
   function createTextFormat(slug, format, icontype) {
	   
   if(icontype == "http") {
	   var icon = wp.element.createElement('img', { src: format[3], width: 20, height: 20, alt: format[1], class: 'gctf_menuicon'});
   } else {
	   var icon = format[3];
   }	   
	   
        return function (props) {
            return wp.element.createElement(
                wp.blockEditor.RichTextToolbarButton, {
                    icon: icon,
                    title: format[2],
                    onClick: function () {
                        props.onChange(wp.richText.toggleFormat(
                            props.value,
                            { type: 'custom-text-format/format' + slug }
                        ));
                    },
                    isActive: props.isActive,
                }
            );
        };
    }
    
  
 // Define a helper function to create the textFormat functions 
 function createSingleTextFormat(slug, format, icontype) { 
	 
   if(icontype == "http") {
	   var icon = wp.element.createElement('img', { src: format[3], width: 20, height: 20, alt: format[1], class: 'gctf_menuicon'});
   } else {
	   var icon = format[3];
   }   
	
	 return function (props) {
    return wp.element.createElement(
      wp.blockEditor.RichTextToolbarButton,
      { 
        icon: icon,
        title: format[2],
        onClick: function() {
          var value = props.value;
          var formatType = 'custom-text-format/format' + slug;

          var hasFormat = value.activeFormats.some(function(format) {
            return format.type === formatType;
          });

          if (hasFormat) {
            // Format already applied, remove it
            value = wp.richText.removeFormat(value, formatType);
          } else {
            // Format not applied, add it
            var newText = wp.richText.create({
              html: format[7]
            });

            // Get the current cursor position
            var { index: cursorIndex } = props.value.start;

            // Insert the format at the current cursor position
            value = wp.richText.insert(value, newText, cursorIndex, cursorIndex);
          }

          props.onChange(value);
        },
        isActive: props.isActive
      }
    );
  };
  }


    // Loop through your data and register the custom text formats
    for (var i = 0; i < formatsArray.length; i++) {
        var format = formatsArray[i];
        
        var icontype = format[3].slice(0,4);
        
        if(format[6] == "block") {
        	 var textFormatFunction = createSingleTextFormat(format[1], format, icontype);
        	 var cName = format[1];
        } else {
	        var textFormatFunction = createTextFormat(format[1], format, icontype);
	        var cName = format[5];
	    }
        
        wp.richText.registerFormatType(
            'custom-text-format/format' + format[1], {
                title: format[2],
                tagName: format[4],
                className: cName,
                edit: textFormatFunction,
            }
        );
    }

})(window.wp);

});