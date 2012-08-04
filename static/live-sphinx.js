utilities.namespace("SymPy");
SymPy.DEFAULT_ANIMATION_DURATION = 800;
SymPy.SphinxShell = SymPy.Shell.$extend({
    __init__: function(config) {
        this.$super(config);
        this.visible = true;
    },

    render: function(el) {
        this.$super(el);

        this.shellEl = $(el);

        var headerLink =
            $('<a href="http://live.sympy.org">SymPy Live Shell</a>');
        var header = $("<h2/>").append(headerLink);
        this.shellEl.prepend(header);

        this.toggleShellEl = $('<button/>').
            html("<span>Hide SymPy Live Shell</span>").
            attr("id", "toggleShell").
            addClass('shown');
        this.toggleShellEl.prepend($('<div class="arrow" />'));

        this.toggleShellEl.appendTo(document.body);
        this.toggleShellEl.click($.proxy(function() {
            this.toggle();
        }, this));

        $('<h3 class="shown">Settings</h3>').
            prependTo($("#settings")).
            click($.proxy(this.toggleSettings, this));
        $("#settings h3").prepend($('<div class="arrow"/>'));

        // We don't need the "force desktop version" option since there is
        // no mobile version
        var checkbox = $('#settings input[type="checkbox"]');
        checkbox.prev().hide();
        checkbox.next().hide();
        checkbox.hide();

        // Make enter the default submission button
        $("#submit-behavior").val("enter");

        // Add a link to Python code that will evaluate it in SymPy Live
        this.processCodeBlocks();

        // Don't expand the list of tab completions (saves space)
        this.completer.expandCompletions = false;

        // Change Fullscreen to go to main website
        $("#fullscreen-button").html("Go to SymPy Live");
    },

    processCodeBlocks: function() {
        $('.highlight-python').each($.proxy(function(index, el) {
            var el = $(el);
            var container = $("<div/>").addClass('sympy-live-eval-toolbar');
            var evaluate = $("<button>evaluate</button>").
                addClass('sympy-live-eval-button').
                appendTo(container);
            $("<span> or </span>").appendTo(container);
            var copy = $("<button>copy</button>").
                addClass('sympy-live-eval-button').
                appendTo(container);
            $("<span> in SymPy Live</span>").appendTo(container);
            el.children('.highlight').prepend(container);

            var fillShell = $.proxy(function() {
                this.show();
                var code = el.find('pre').text();
                var lines = code.split(/\n/g);
                console.log(lines);
                var codeLines = [];
                for (var i = 0; i < lines.length; i++) {
                    if (lines[i].substring(0, 4) === ">>> " ||
                        lines[i].substring(0, 4) === "... ") {
                        codeLines.push(
                            lines[i].substring(4, lines[i].length));
                    }
                }
                this.setValue(codeLines.join('\n'));
            }, this);

            evaluate.click($.proxy(function() {
                fillShell();
                this.evaluate();
            }, this));

            copy.click($.proxy(function() {
                fillShell();
                this.focus();
            }, this));
        }, this));
    },

    hide: function(duration) {
        if (typeof duration === "undefined") {
            duration = SymPy.DEFAULT_ANIMATION_DURATION;
        }
        this.disablePrompt();

        this.shellDimensionsRestored = {
            width: this.shellEl.width(),
            height: this.shellEl.height(),
            opacity: 1
        };

        this.shellEl.animate({
            width: 0,
            height: 0,
            opacity: 0
        }, duration);
        this.visible = false;

        this.toggleShellEl.removeClass('shown').children('span').
            html("Show SymPy Live Shell");
    },

    show: function(duration) {
        if (this.visible) return;

        if (typeof duration === "undefined") {
            duration = SymPy.DEFAULT_ANIMATION_DURATION;
        }
        this.enablePrompt();
        $(this.shellEl).animate(
            this.shellDimensionsRestored,
            duration,
            function() {
                // Don't fix the height so that if the settings are
                // expanded, the shell will expand with them
                $(this).css('height', 'auto');
            });
        this.visible = true;
        this.toggleShellEl.addClass('shown').children('span').
            html("Hide SymPy Live Shell");
    },

    toggle: function(duration) {
        if (typeof duration === "undefined") {
            duration = SymPy.DEFAULT_ANIMATION_DURATION;
        }
        if (this.isVisible()) {
            this.hide(duration);
        }
        else {
            this.show(duration);
        }
    },

    toggleSettings: function(duration) {
        if (typeof duration === "undefined") {
            duration = SymPy.DEFAULT_ANIMATION_DURATION;
        }

        if ($("#settings .content").is(":visible")) {
            $("#settings .content").slideUp(duration);
            $("#settings h3").removeClass('shown');
        }
        else {
            $("#settings .content").slideDown(duration);
            $("#settings h3").addClass('shown');
        }
    },

    isVisible: function() {
        return this.visible;
    },

    fullscreen: function() {
        window.open("http://live.sympy.org");
    }
});

$(document).ready(function() {
    var shellEl = $('<div id="shell"/>').appendTo($(document.body));
    var settingsEl = $('<div id="settings"><div class="content"></div></div>');
    settingsEl.appendTo(shellEl);  // Needed to render the shell

    var shell = new SymPy.SphinxShell({baseName: 'live-sphinx.js'});
    shell.render(shellEl);
    settingsEl.appendTo(shellEl); // Put it under the shell
    shell.toggleSettings();
    shell.hide(0);
});
