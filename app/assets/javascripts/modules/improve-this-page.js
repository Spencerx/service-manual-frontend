(function (Modules) {
  "use strict";

  function ImproveThisPage () {
    this.controller = null;
    this.view = null;

    this.start = function ($element) {
      this.view = new View($element);
      this.controller = new Controller(this.view);

      this.controller.init();
    }
  };

  function View ($element) {
    var that = this;

    this.$pageIsUsefulButton = $element.find('.js-page-is-useful');
    this.$offerFeedbackButton = $element.find('.js-offer-feedback');
    this.$feedbackFormContainer = $element.find('.js-feedback-form');
    this.$feedbackForm = that.$feedbackFormContainer.find('form');
    this.$feedbackFormSubmitButton = that.$feedbackFormContainer.find('[type=submit]');
    this.$prompt = $element.find('.js-prompt');

    this.onPageIsUsefulButtonClicked = function (callback) {
      that.$pageIsUsefulButton.on('click', preventingDefault(callback));
    }

    this.onOfferFeedback = function (callback) {
      that.$offerFeedbackButton.on('click', preventingDefault(callback));
    }

    this.onSubmitFeedbackForm = function (callback) {
      that.$feedbackForm.on('submit', preventingDefault(callback));
    }

    this.replaceWithSuccess = function () {
      $element.html('Thanks for your feedback.');
    }

    this.replaceWithGenericError = function () {
      $element.html('Sorry, we’re unable to receive your message right now. We have other ways for you to provide feedback on the <a href=\"/contact/govuk\">contact page</a>.');
    }

    this.showFeedbackForm = function () {
      that.$prompt.addClass('js-hidden');
      that.$feedbackFormContainer.removeClass('js-hidden');
    }

    this.$feedbackFormContainerData = function () {
      return that.$feedbackFormContainer.find('input, textarea').serialize();
    }

    this.$feedbackFormContainerTrackEventParams = function () {
      return {
        category: that.$feedbackFormContainer.data('track-category'),
        action: that.$feedbackFormContainer.data('track-action')
      }
    }

    this.pageIsUsefulTrackEventParams = function () {
      return {
        category: that.$pageIsUsefulButton.data('track-category'),
        action: that.$pageIsUsefulButton.data('track-action')
      }
    }

    this.renderErrors = function (errors) {
      that.$feedbackFormContainer.find('.js-error').remove();

      $.each(errors, function (attrib, messages) {
        $.each(messages, function (index, message) {
          var $errorNode = $('<div/>', {
            'class': 'improve-this-page__error js-error',
            'text': attrib + ' ' + message + '.'
          });
          var $field = that.$feedbackFormContainer.find('[name="'+ attrib + '"]');

          // If there is a field with the same name as the error attribute
          // then display the error inline with the field. If a matching field
          // doesn't exist then display it above the form.
          if ($field.length) {
            $field.before($errorNode);
          } else {
            that.$feedbackFormContainer.find('.js-errors').append($errorNode);
          }
        });
      });
    }

    this.disableSubmitFeedbackButton = function () {
      that.$feedbackFormSubmitButton.prop('disabled', true);
    }

    this.enableSubmitFeedbackButton = function () {
      that.$feedbackFormSubmitButton.removeAttr('disabled');
    }

    function preventingDefault(callback) {
      return function (event) {
        event.preventDefault();
        callback();
      }
    }
  };

  function Controller (view) {
    var that = this;

    this.init = function () {
      that.bindPageIsUsefulButton();
      that.bindOfferFeedbackButton();
      that.bindSubmitFeedbackButton();
    }

    this.bindPageIsUsefulButton = function () {
      view.onPageIsUsefulButtonClicked(that.handlePageIsUseful);
    }

    this.bindOfferFeedbackButton = function () {
      view.onOfferFeedback(view.showFeedbackForm);
    }

    this.bindSubmitFeedbackButton = function () {
      view.onSubmitFeedbackForm(that.handleSubmitFeedback);
    }

    this.handlePageIsUseful = function () {
      if (GOVUK.analytics && GOVUK.analytics.trackEvent) {
        var eventParams = view.pageIsUsefulTrackEventParams();
        GOVUK.analytics.trackEvent(eventParams.category, eventParams.action);
      }

      view.replaceWithSuccess();
    }

    this.handleSubmitFeedback = function () {
      $.ajax({
        type: "POST",
        url: "/contact/govuk/page_improvements",
        data: view.$feedbackFormContainerData(),
        beforeSend: view.disableSubmitFeedbackButton
      }).done(function () {
        if (GOVUK.analytics && GOVUK.analytics.trackEvent) {
          var eventParams = view.$feedbackFormContainerTrackEventParams();
          GOVUK.analytics.trackEvent(eventParams.category, eventParams.action);
        }

        view.replaceWithSuccess();
      }).fail(function (xhr) {
        if (xhr.status == 422) {
          view.renderErrors(xhr.responseJSON.errors);

          view.enableSubmitFeedbackButton();
        } else {
          view.replaceWithGenericError();
        }
      });
    }
  };

  Modules.ImproveThisPage = ImproveThisPage;
})(window.GOVUK.Modules);
