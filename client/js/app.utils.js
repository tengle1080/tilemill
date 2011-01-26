var PopupView = Backbone.View.extend({
    initialize: function () {
        _.bindAll(this, 'render');
        this.render();
    },
    render: function () {
        $(this.el).html(ich.PopupView(this.options));
        var that = this;
        $('body').keyup(function(e) {
          if (e.keyCode == 27) { that.close() }   // esc
        });
        window.app.el.append(this.el);
        return this;
    },
    loading: function(message) {
        this.loadingView = new LoadingView({message: message});
        this.$('.popup').append(this.loadingView.el);
    },
    done: function() {
        this.loadingView && this.loadingView.remove();
    },
    close: function() {
        this.remove();
        window.app.activePopup = false;
        if ($.isFunction(this.options.after)) {
            this.options.after(this);
        }
        return false;
    },
    events: {
        'click .close': 'close'
    }
});

var DropdownView = Backbone.View.extend({
    className: 'DropdownView',
    initialize: function() {
        _.bindAll(this, 'render', 'showContent');
        this.render();
    },
    render: function() {
        $(this.el).html(ich.DropdownView(this.options));
        var that = this;
        $(window).bind('click', function() {
            that.hideContent();
        });
        return this;
    },
    events: {
        'click a.show': 'toggleContent'
    },
    toggleContent: function() {
        this.$('.show').toggleClass('active');
        this.$('.dropdown-content').toggleClass('expanded');
        return false;
    },
    hideContent: function() {
        this.$('.show').removeClass('active');
        this.$('.dropdown-content').removeClass('expanded');
    }
});

var DrawerView = Backbone.View.extend({
    className: 'drawer',
    events: {
        'click .close': 'remove'
    },
    initialize: function () {
        _.bindAll(this, 'render');
        this.render();
    },
    render: function () {
        // Mark any existing drawers as stale to be removed after this new
        // drawer has finished rendering.
        $('.drawer').addClass('staleDrawer');
        var that = this;
        window.app.el.append($(this.el));
        $(this.el).html(ich.DrawerView(this.options));
        $(this.el).animate({left: '0%'}, function() {
            $('.staleDrawer').remove();
            that.trigger('render');
        });
        return this;
    },
    remove: function() {
        $('.drawer-content', this.el).children().fadeOut('fast');
        $(this.el).animate( {left: '-100%'}, function() { $(this).remove() });
        return false;
    }
});

var LoadingView = Backbone.View.extend({
    initialize: function () {
        _.bindAll(this, 'render');
        this.render();
    },
    render: function () {
        $(this.el).html(ich.LoadingView(this.options));
        return this;
    }
});

var ErrorView = Backbone.View.extend({
    initialize: function () {
        _.bindAll(this, 'render');
        this.render();
    },
    render: function () {
        $(this.el).html(ich.ErrorView(this.options));
        window.app.el.html(this.el);
        return this;
    }
});

/**
 * View: SettingsPopupView
 */
var SettingsPopupView = PopupView.extend({
    events: _.extend({
        'click input.submit': 'submit'
    }, PopupView.prototype.events),
    initialize: function(params) {
        _.bindAll(this, 'render', 'submit');
        this.model = this.options.model;
        this.options.title = 'Settings';
        this.options.content = ich.SettingsPopupView({
            'minimal_mode': (this.model.get('mode') === 'minimal')
        }, true);
        this.render();
    },
    submit: function() {
        var success = this.model.set(
            { 'mode': $('select#mode', this.el).val() },
            { 'error': this.showError }
        );
        if (success) {
            this.model.save();
            this.remove();
        }
        return false;
    },
    showError: function(model, error) {
        window.app.message('Error', error);
    }
});
