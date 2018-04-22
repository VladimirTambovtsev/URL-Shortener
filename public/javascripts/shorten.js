$('.btn-shorten').on('click', function(){

  $.ajax({
    type: 'POST',
    data: JSON.stringify({url: $('#url-field').val()}),     // !
    contentType: 'application/json',
    url: 'http://localhost:3000/endpoint'
  })
  .done(function(data) {
     $.ajax({
        type: 'GET',
        contentType: 'application/json',
        url: 'http://localhost:3000/short'
      })
     .done(function(shortLink) {
        console.log(JSON.stringify(shortLink));
      })
     .fail(function(jqXHR, textStatus, err) {
        console.log('ajax error response: ', textStatus);
     });
  });
    // success: function(data){
    //     console.log('success');
    //     console.log(data);
    //     var resultHTML = '<a class="result" href="' + data.shortUrl + '">'
    //         + data.shortUrl + '</a>' + data.longUrl;
    //     $('#link').html(resultHTML);
    //     $('#link').hide().fadeIn('slow');
    // }
    // ,
    // error: function(jqXHR, textStatus, err) {
    //     //show error message
    //     alert('text status '+textStatus+', \n err: '+err)
    // }
  });

});
