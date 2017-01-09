require 'gds_api/content_store'
require 'slimmer/headers'

class ContentItemsController < ApplicationController
  include Slimmer::Headers
  include Slimmer::Template
  rescue_from GdsApi::HTTPForbidden, with: :error_403

  def show
    slimmer_template :without_footer_links

    if load_content_item
      set_expiry
      set_locale
      configure_header_search
      configure_feedback_form
      render content_item_template
    else
      configure_header_search
      render text: 'Not found', status: :not_found
    end
  end

private

  def load_content_item
    begin
      @content_item = present(
        content_store.content_item(content_item_path)
      )
    rescue GdsApi::HTTPNotFound
      nil
    end
  end

  def present(content_item)
    class_name = content_item['format'].sub(/^service_manual_/, '').classify
    presenter_name = class_name + 'Presenter'
    presenter_class = Object.const_get(presenter_name)
    presenter_class.new(content_item)
  rescue NameError
    raise "No support for format \"#{content_item['format']}\""
  end

  def content_item_template
    @content_item.format
  end

  def set_expiry
    max_age = @content_item.content_item.cache_control.max_age
    cache_private = @content_item.content_item.cache_control.private?
    expires_in(max_age, public: !cache_private)
  end

  def set_locale
    I18n.locale = @content_item.locale || I18n.default_locale
  end

  def content_item_path
    '/' + URI.encode(params[:path])
  end

  def content_store
    @content_store ||= GdsApi::ContentStore.new(Plek.current.find("content-store"))
  end

  def configure_header_search
    if @content_item.present? && !@content_item.include_search_in_header?
      remove_header_search
    else
      scope_header_search_to_service_manual
    end
  end

  def configure_feedback_form
    # The Slimmer middleware is responsible for intercepting the response and
    # wrapping it with the GOV.UK header and footer. We want to use our own
    # 'report a problem' pattern, so opt out of the bundled one.
    if @content_item.present? && @content_item.use_new_style_feedback_form?
      set_slimmer_headers(
        report_a_problem: "false"
      )
    end
  end

  def scope_header_search_to_service_manual
    # Slimmer is middleware which wraps the service manual in the GOV.UK header
    # and footer. We set a response header so that Slimmer adds a hidden field
    # to the header search to scope the search results to just the service
    # manual.
    set_slimmer_headers(
      search_parameters: {
        "filter_manual" => "/service-manual"
      }.to_json,
    )
  end

  def remove_header_search
    set_slimmer_headers(remove_search: true)
  end

  def error_403(exception)
    render text: exception.message, status: 403
  end
end
