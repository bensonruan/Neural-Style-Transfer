const model = new mi.ArbitraryStyleTransferNetwork();
const canvas = document.getElementById('stylized');
const ctx = canvas.getContext('2d');
const contentImg = document.getElementById('contentImg');
const styleImg = document.getElementById('styleImg');
let contentHeight;
let styleHeight;

$( document ).ready(function() {
	var inputs = document.querySelectorAll( '.inputfile' );
	Array.prototype.forEach.call( inputs, function( input )
	{
		var label	 = input.nextElementSibling,
			labelVal = label.innerHTML;

		input.addEventListener( 'change', function( e )
		{
			var fileName = '';
			if( this.files && this.files.length > 1 )
				fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
			else
				fileName = e.target.value.split( '\\' ).pop();

			if( fileName ){
				label.querySelector( 'span' ).innerHTML = fileName;
                if(this.attributes['target'].value=='content'){
                    loadImage(e, contentImg);
                }else if(this.attributes['target'].value=='style'){
                    loadImage(e,styleImg);
                }				
			}
			else{
				label.innerHTML = labelVal;
			}
		});

		// Firefox bug fix
		input.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
		input.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });
    });
});

$('#contentImg').on('load', function () {
    contentHeight = $(this).height();
    $('.canvasContainer').height(contentHeight);
}).each(function() {
     if (this.complete) $(this).trigger('load');
});

$('#styleImg').on('load', function () {
    styleHeight = $(this).height();
}).each(function() {
     if (this.complete) $(this).trigger('load');
});

$(".btn-transfer").click(function () {
  startTransfering();
  model.initialize().then(() => {
    stylize();
  });
});

async function clearCanvas() {
  // Don't block painting until we've reset the state.
  await mi.tf.nextFrame();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  await mi.tf.nextFrame();
}
  
async function stylize() {
  await clearCanvas();
  
  // Resize the canvas to be the same size as the source image.
  canvas.width = contentImg.width;
  canvas.height = contentImg.height;
  
  // This does all the work!
  model.stylize(contentImg, styleImg).then((imageData) => {
    finishTransfering();
    ctx.putImageData(imageData, 0, 0);
  });
}

function loadImage(event, imgElement) {
  const reader = new FileReader();
  reader.onload = (e) => {
    imgElement.src = e.target.result;
  };
  reader.readAsDataURL(event.target.files[0]);
}

function startTransfering() {
    $('.imageContainer').addClass('scanning');
    playScan();
    $('#transfering').removeClass('d-none');
    $('#stylized').addClass('d-none');
}

function finishTransfering() {
    $('.imageContainer').removeClass('scanning');
    $('#transfering').addClass('d-none');
    $('#stylized').removeClass('d-none');
}

function playScan(){
    $.keyframe.define([{
        name: 'scan-content',
        '0%': {'top': '0px'},
        '100%': {'top': contentHeight-15}
    }]);
    $.keyframe.define([{
        name: 'scan-style',
        '0%': {'top': styleHeight-15},
        '100%': {'top': '0px'}
    }]);

    $('.scan-content').resetKeyframe(function() {
        $(".scan-content").playKeyframe({
            name: 'scan-content', 
            duration: '3s', 
            timingFunction: 'linear', 
            delay: '0s', 
            iterationCount: 'infinite', 
            direction: 'alternate-reverse'
        });
    });

    $('.scan-style').resetKeyframe(function() {
        $(".scan-style").playKeyframe({
            name: 'scan-style', 
            duration: '3s', 
            timingFunction: 'linear', 
            delay: '0s', 
            iterationCount: 'infinite', 
            direction: 'alternate-reverse'
        });
    });
}