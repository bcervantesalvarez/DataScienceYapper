// /scripts/privacy-form.js
//
// Hardens the contact form on /content/privacy/ against the most common
// drive-by spam:
//   1. Two-field honeypot ("website" + "phone") — bots fill them; humans don't.
//   2. Minimum dwell time — submissions faster than MIN_DWELL_MS are dropped.
//   3. Cloudflare Turnstile (optional) — loaded only if a real site key
//      is set; bypassed silently otherwise so the form still works locally.

(function () {
  'use strict';

  var MIN_DWELL_MS = 2500;          // anything faster is almost certainly a bot
  var SUBMIT_TIMEOUT_MS = 15000;    // failsafe if the iframe never reports back

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('policyForm');
    if (!form) return;

    var submit = document.getElementById('policyFormSubmit');
    var status = document.getElementById('policyFormStatus');

    // Passive context fields
    setValue(form, 'referrer',     document.referrer || '');
    setValue(form, 'userAgent',    navigator.userAgent || '');
    setValue(form, 'formLoadedAt', String(Date.now()));

    // Ensure the iframe target exists (defensive — markup already creates it)
    var frame = document.getElementById('policyFormTarget');
    if (!frame) {
      frame = document.createElement('iframe');
      frame.id = 'policyFormTarget';
      frame.name = 'policyFormTarget';
      frame.title = 'Form submission target';
      frame.style.display = 'none';
      document.body.appendChild(frame);
      form.setAttribute('target', 'policyFormTarget');
    }

    // Optional Cloudflare Turnstile loader. Only fires when a real key is set.
    maybeLoadTurnstile(form);

    var pendingSubmit = false;
    var failsafe = null;

    frame.addEventListener('load', function () {
      if (!pendingSubmit) return;
      pendingSubmit = false;
      clearTimeout(failsafe);
      var next = (form.querySelector('input[name="_next"]') || {}).value || '/';
      window.location.href = next;
    });

    form.addEventListener('submit', function (event) {
      hideStatus(status);

      // Bot check 1: honeypots must be empty
      if (honeypotFilled(form)) {
        event.preventDefault();
        showStatus(status, 'Message could not be sent. Please try again.', true);
        return;
      }

      // Bot check 2: minimum dwell time
      var loadedAt = Number((form.querySelector('input[name="formLoadedAt"]') || {}).value || 0);
      if (!loadedAt || (Date.now() - loadedAt) < MIN_DWELL_MS) {
        event.preventDefault();
        showStatus(status, 'Please take a moment before sending.', true);
        return;
      }

      // Trust HTML constraints for the rest
      if (!form.checkValidity()) {
        // Let the browser show its native messages
        return;
      }

      pendingSubmit = true;
      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Sending…';
      }
      showStatus(status, 'Sending your message…', false);

      clearTimeout(failsafe);
      failsafe = setTimeout(function () {
        pendingSubmit = false;
        if (submit) {
          submit.disabled = false;
          submit.textContent = 'Send message';
        }
        showStatus(
          status,
          'The submission seems stalled. Check your connection and try again.',
          true
        );
      }, SUBMIT_TIMEOUT_MS);
    });
  });

  function setValue(form, name, value) {
    var input = form.querySelector('input[name="' + name + '"]');
    if (input) input.value = value;
  }

  function honeypotFilled(form) {
    return ['website', 'phone'].some(function (name) {
      var el = form.querySelector('input[name="' + name + '"]');
      return el && el.value && el.value.trim().length > 0;
    });
  }

  function showStatus(node, text, isError) {
    if (!node) return;
    node.textContent = text;
    node.classList.add('is-visible');
    node.classList.toggle('is-error', !!isError);
  }

  function hideStatus(node) {
    if (!node) return;
    node.textContent = '';
    node.classList.remove('is-visible', 'is-error');
  }

  function maybeLoadTurnstile(form) {
    var widget = form.querySelector('.cf-turnstile');
    if (!widget) return;
    var key = widget.getAttribute('data-sitekey') || '';
    // Hide the widget entirely until a real key is configured.
    if (!key || key.indexOf('REPLACE_WITH_') === 0) {
      widget.style.display = 'none';
      return;
    }
    if (document.querySelector('script[data-cf-turnstile]')) return;
    var s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    s.async = true;
    s.defer = true;
    s.setAttribute('data-cf-turnstile', '1');
    document.head.appendChild(s);
  }
})();
