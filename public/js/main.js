var updating = false;

$(document).ready(function() {
	$(".menu").sticky({
		topSpacing:20,
		getWidthFrom: '.user .column-a'
	});
	
	$(".menu li").click(function() {
		var $source = $(this).attr('id');
		var $target = $('section.'+$source);
		
		$('html,body').animate({
          scrollTop: $target.offset().top
        }, 400);
	});
	
	$('.update-user').click(function(e) {
		e.preventDefault();
		var $that = $(this);
		
		$('.error-container').remove();
		
		if(!updating) {
			updating = true;
			$(this).text('Updating...');
			$(this).css('background-color','#efbabc');
			$.ajax({
				type: "POST",
				url: "/update/user/progress",
				dataType: "HTML",
				success: function() {
					updating = false;
					window.location.reload();
				},
				error: function(err) {
					if(err.status == 401) { window.location.reload('/login'); }
					$('section.goal h2:eq(0)').after('<div class="error-container"><p>An error occured whilst updating your stats, please try again.</p></div>');
					$that.text('Update');
					$that.css('background-color','');
					updating = false;
				}
			});
		}
	});
	
	$('.delete-button').on('click', function(e) {
		var $that = $(this);
		var $target = $(this).parent().find($('a')).attr('href');
		$(this).parent().slideUp(200);
		$('.website-error-active').slideUp(200).removeClass('website-error-active');
		
		$.ajax({
			type: "POST",
			url: "/update/websites/delete",
			dataType: "HTML",
			data: {"address": $target},
			success: function() {
				$that.parent().remove();
				if(!$('.websites > ul > li').length) {
					$('p.websites-error-message').text('You currently have no websites saved, click add below to get started.').slideDown(200);
				} else {
					$('.websites > ul > li').removeClass('odd').removeClass('even');
					$('.websites > ul > li').each(function(i){
						if(i % 2 == 0) {
							$(this).addClass('even');
						} else {
							$(this).addClass('odd');
						}
					});
				}
			},
			error: function(err) {
				if(err.status == 401) { window.location.reload('/login'); }
				$that.parent().slideDown(200);
				$('p.websites-error-message').addClass('website-error-active').text('There was a problem updating your list, please try again.').slideDown(200);
			}
		});
	});
	
	$('.show-add-site').click(function(e){
		e.preventDefault();
		$('.websites-error-message').slideUp(200).removeClass('website-error-active');
		$('.add-site').slideDown(400, function() {
			$('.show-add-site-container').fadeOut(200);
		});
	});
	
	$('#site-submit').on('click',function(e){
		var $that = $(this);
		var form = $('#add-site');
		$('#site-submit').attr('value','Saving…');
		$('#site-submit').css('background-color','#efbabc');
		
		if (false === form.parsley().validate())
        	return;
        	
        var name = $('#site_name').val();	
        var domain = $('#site_domain').val();
        
        var domain = domain.processLink();
        
        var form_data = {
        	"name" : name,
        	"domain" : domain
        };
	
		$.ajax({
			type: "POST",
			url: "/update/websites/add",
			dataType: "HTML",
			data: form_data,
			success: function() {
				var new_list_item = '<li class="new_list_item"><img src="http://www.google.com/s2/favicons?domain=' + domain + '"><a href="'+ domain +'" target="_blank">'+ name +'</a><div class="delete-button"></div></li>';
				
				$('.website-list-ul').append(new_list_item);
				
				$('.website-list-ul > li').each(function(i){
					if(i % 2 == 0) {
						$(this).removeClass('even').removeClass('odd').addClass('even');
					} else {
						$(this).removeClass('even').removeClass('odd').addClass('odd');
					}
				});
				
				$('.new_list_item').bind('click',function(e) {
					var $that = $(this).find($('.delete-button'));
					
					console.log($that.parent().find($('a')).attr('href'));
					
					var $target = $that.parent().find($('a')).attr('href');
					$that.parent().slideUp(200);
					$('.website-error-active').slideUp(200).removeClass('website-error-active');
					
					$.ajax({
						type: "POST",
						url: "/update/websites/delete",
						dataType: "HTML",
						data: {"address": $target},
						success: function() {
							$that.parent().remove();
							if(!$('.websites > ul > li').length) {
								$('p.websites-error-message').text('You currently have no websites saved, click add below to get started.').slideDown(200);
							} else {
								$('.websites > ul > li').removeClass('odd').removeClass('even');
								$('.websites > ul > li').each(function(i){
									if(i % 2 == 0) {
										$(this).addClass('even');
									} else {
										$(this).addClass('odd');
									}
								});
							}
						},
						error: function(err) {
							if(err.status == 401) { window.location.reload('/login'); }
							$that.parent().slideDown(200);
							$('p.websites-error-message').addClass('website-error-active').text('There was a problem updating your list, please try again.').slideDown(200);
						}
					});
				}).slideDown(200).removeClass('new_list_item');
				
				$('#site-submit').attr('value','Save').css('background-color','');
				$('.show-add-site-container').fadeIn(200);
				$('.add-site').slideUp(400);
				
				$('#add-site').parsley().reset();
				$('#add-site').trigger("reset");
			}, error: function(err) {
				if(err.status == 401) { window.location.reload('/login'); }
				if(err.responseText) {
					$('p.websites-error-message').addClass('website-error-active').text(err.responseText).slideDown(200);
				} else {
					$('p.websites-error-message').addClass('website-error-active').text('There was a problem updating your list, please try again.').slideDown(200);
				}
				$('#site-submit').attr('value','Save').css('background-color','');
				$('.show-add-site-container').fadeIn(200);
				$('.add-site').slideUp(400);
			}
		});
		
		e.preventDefault();
		return false;
	});
	
	$('#settings-submit').on('click',function(e){
		var $that = $(this);
		var form = $('#settings-form');
		$that.attr('value','Saving…');
		$that.css('background-color','#efbabc');
		$('.error-container').slideUp(200,function() {
			$(this).remove();
		});
		
		if (false === form.parsley().validate()) {
			$that.attr('value','Save').css('background-color','').blur();
			return;
		}
		
		if(($('#active_minutes_start_hour').val() + $('#active_minutes_start_minute').val()) >= ($('#active_minutes_end_hour').val() + $('#active_minutes_end_minute').val())) {
			$('.black-hole-error').remove();
			$('.settings-form-errors').append('<ul class="black-hole-error"><li>Your start time needs to be lower than your end time, or a black hole appears.</li></ul>')
			$that.attr('value','Save').css('background-color','').blur();
			e.preventDefault();
			return false;
		} else if(($('#active_minutes_start_hour').val() + $('#active_minutes_start_minute').val()) < ($('#active_minutes_end_hour').val() + $('#active_minutes_end_minute').val())) {
			$('.black-hole-error').remove();
		}	
		
		var form_data = {
			"goal_type": $('input[name=goal_type]:radio:checked').val(),
			"active_minutes_start_hour": $('#active_minutes_start_hour').val(),
			"active_minutes_start_minute": $('#active_minutes_start_minute').val(),
			"active_minutes_end_hour": $('#active_minutes_end_hour').val(),
			"active_minutes_end_minute": $('#active_minutes_end_minute').val(),
			"strictness": $('#strictness').val()
		};
	
		$.ajax({
			type: "POST",
			url: "/update/settings/",
			dataType: "HTML",
			data: form_data,
			success: function() {
				$that.attr('value','Save').css('background-color','').blur();
				window.location.reload('/account');
			}, error: function(err) {
				if(err.status == 401) { setTimeout(window.location.reload('/login'), 3000); }
				if(err.responseText) {
					$('section.settings h2:eq(0)').after('<div class="error-container"><p>' + err.responseText + '</p></div>');
				} else {
					$('section.settings h2:eq(0)').after('<div class="error-container"><p>There was a problem updating your settings, please try again.</p></div>');
				}
				$that.attr('value','Save').css('background-color','').blur();
			}
		});
		
		e.preventDefault();
		return false;
	});
	
	if($('span.score').length > 0) {
		$('.steps span.score').numberClimb({'comma': true});
		$('.distance span.score').numberClimb({'comma': true, 'decimal': true});
		$('.active-minutes span.score').numberClimb();
		$('.calories span.score').numberClimb({'comma':true});
		$('.steps').progressBar();
		$('.calories').progressBar();
		$('.active-minutes').progressBar();
		$('.distance').progressBar();
	}
});

$(window).load(function() {
	heightGain($('.icon-outter'));
	heightGain($('.progress-inner'));
	heightGain($('.progress-difference'));
	heightGain($('.progress-difference-inner'));
});

$(window).focus(function() {
	$(".menu").sticky({
		topSpacing:20,
		getWidthFrom: '.user .column-a'
	});
});

$(window).resize(function () {
	heightGain($('.icon-outter'));
	heightGain($('.progress-inner'));
	heightGain($('.progress-difference'));
	heightGain($('.progress-difference-inner'));
});

function heightGain(elem) {
	if(elem.length > 0) {
		var width = elem.width();
		elem.height(width);
	}
}

String.prototype.processLink = function() {
	var url = String(this);

   	if (!/^(f|ht)tps?:\/\//i.test(url)) {
    	url = "http://" + url;
   	}
   	
   	url = url.parseUri().protocol + "://" + url.parseUri().host;
   	
   	return url;
}

String.prototype.parseUri = function() {
		var options = {
        strictMode: false,
        key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
        q:   {
                name:   "queryKey",
                parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser: {
                strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
};

        var     str = String(this),
        		o   = options,
                m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
                uri = {},
                i   = 14;

        while (i--) uri[o.key[i]] = m[i] || "";

        uri[o.q.name] = {};
        uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
                if ($1) uri[o.q.name][$1] = $2;
        });

        return uri;
};