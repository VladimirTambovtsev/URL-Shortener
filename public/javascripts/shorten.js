$('.btn-shorten').on('click', function(){

  $.ajax({
    type: 'POST',
    data: JSON.stringify({url: $('#url-field').val()}),     // !
    contentType: 'application/json',
    url: 'http://localhost:3000/endpoint',
    success: function(data){
        console.log('success');
        console.log(data);
        var resultHTML = '<a class="result" href="' + data.shortUrl + '">'
            + data.shortUrl + '</a>' + data.longUrl;
        $('#link').html(resultHTML);
        $('#link').hide().fadeIn('slow');
    }
    // ,
    // error: function(jqXHR, textStatus, err) {
    //     //show error message
    //     alert('text status '+textStatus+', \n err: '+err)
    // }
  });

});
