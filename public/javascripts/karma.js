$(document).ready(function () {
    $('.vote').click(function (){
        var button, inverse_element_id, value;
        var this_element = $($(this)[0]);
        console.log($(this)[0]);
        if (this_element.hasClass("thread")){
            var url = "/api/vote/thread";
            var element_id = this_element.attr("data-thread-id");
            var karma = $("#thread-karma" + element_id);

            if (this_element.hasClass("upvote")){
                inverse_element_id = $($(".downvote.thread[data-thread-id='" + element_id + "']")[0]);
                value = this_element.hasClass('upvoted') ? 0 : 1;
            }else{
                inverse_element_id = $($(".upvote.thread[data-thread-id='" + element_id + "']")[0]);
                value = this_element.hasClass('downvoted') ? 0 : -1;
            }

        }else if (this_element.hasClass("comment")){
            var url = "/api/vote/comment";
            var element_id = this_element.attr("data-comment-id");
            var karma = $("#comment-karma" + element_id);

            if (this_element.hasClass("upvote")) {
                inverse_element_id = $($(".downvote.comment[data-comment-id='" + element_id + "']")[0]);
                value = this_element.hasClass('upvoted') ? 0 : 1;
            } else {
                inverse_element_id = $($(".upvote.comment[data-comment-id='" + element_id + "']")[0]);
                value = this_element.hasClass('downvoted') ? 0 : -1;
            }
        }

        $.post(url, {
            val: value,
            id: element_id
        }).done(function (data) {
            if (data.user_vote == 1) this_element.addClass('upvoted');
            else if (data.user_vote == -1) this_element.addClass('downvoted');
            else {
                this_element.removeClass('upvoted');
                this_element.removeClass('downvoted');
            }
            inverse_element_id.removeClass("downvoted");
            inverse_element_id.removeClass("upvoted");
            karma.text(data.total);
        }).fail(function (data) {
            alert("Error");
        });
    });

});