/* https://github.com/ai/audio-recorder-polyfill */
(function() {
    var j = {};
    j = function() {
        var t = 2,
            n = [];
        onmessage = function(e) {
            "encode" === e.data[0] ? function(e) {
                for (var s = e.length, a = new Uint8Array(s * t), i = 0; i < s; i++) {
                    var r = i * t,
                        U = e[i];
                    U > 1 ? U = 1 : U < -1 && (U = -1), U *= 32768, a[r] = U, a[r + 1] = U >> 8
                }
                n.push(a)
            }(e.data[1]) : "dump" === e.data[0] && function(e) {
                var s = n.length ? n[0].length : 0,
                    a = n.length * s,
                    i = new Uint8Array(44 + a),
                    r = new DataView(i.buffer);
                r.setUint32(0, 1380533830, !1), r.setUint32(4, 36 + a, !0), r.setUint32(8, 1463899717, !1), r.setUint32(12, 1718449184, !1), r.setUint32(16, 16, !0), r.setUint16(20, 1, !0), r.setUint16(22, 1, !0), r.setUint32(24, e, !0), r.setUint32(28, e * t, !0), r.setUint16(32, t, !0), r.setUint16(34, 8 * t, !0), r.setUint32(36, 1684108385, !1), r.setUint32(40, a, !0);
                for (var U = 0; U < n.length; U++)
                    i.set(n[U], U * s + 44);
                n = [], postMessage(i.buffer, [i.buffer])
            }(e.data[1])
        }
    };
    var k = {};
    function l(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    function g(e, t) {
        for (var r = 0; r < t.length; r++) {
            var a = t[r];
            a.enumerable = a.enumerable || !1, a.configurable = !0, "value" in a && (a.writable = !0), Object.defineProperty(e, a.key, a)
        }
    }
    function m(e, t, r) {
        return t && g(e.prototype, t), r && g(e, r), e
    }
    var b,
        f,
        h = window.AudioContext || window.webkitAudioContext;
    function o(e) {
        var t = e.toString().replace(/^(\(\)\s*=>|function\s*\(\))\s*{/, "").replace(/}$/, ""),
            r = new Blob([t]);
        return new Worker(URL.createObjectURL(r))
    }
    function d(e) {
        var t = new Event("error");
        return t.data = new Error("Wrong state for " + e), t
    }
    var c = function() {
        function e(t) {
            l(this, e), this.stream = t, this.state = "inactive", this.em = document.createDocumentFragment(), this.encoder = o(e.encoder);
            var r = this;
            this.encoder.addEventListener("message", function(e) {
                var t = new Event("dataavailable");
                t.data = new Blob([e.data], {
                    type: r.mimeType
                }), r.em.dispatchEvent(t), "inactive" === r.state && r.em.dispatchEvent(new Event("stop"))
            })
        }
        return m(e, [{
            key: "start",
            value: function(e) {
                if ("inactive" !== this.state)
                    return this.em.dispatchEvent(d("start"));
                this.state = "recording", b || (b = new h), this.clone = this.stream.clone(), this.input = b.createMediaStreamSource(this.clone), f || (f = b.createScriptProcessor(2048, 1, 1));
                var t = this;
                t.encoder.postMessage(["init", b.sampleRate]), f.onaudioprocess = function(e) {
                    "recording" === t.state && t.encoder.postMessage(["encode", e.inputBuffer.getChannelData(0)])
                }, this.input.connect(f), f.connect(b.destination), this.em.dispatchEvent(new Event("start")), e && (this.slicing = setInterval(function() {
                    "recording" === t.state && t.requestData()
                }, e))
            }
        }, {
            key: "stop",
            value: function() {
                return "inactive" === this.state ? this.em.dispatchEvent(d("stop")) : (this.requestData(), this.state = "inactive", this.clone.getTracks().forEach(function(e) {
                    e.stop()
                }), this.input.disconnect(), clearInterval(this.slicing))
            }
        }, {
            key: "pause",
            value: function() {
                return "recording" !== this.state ? this.em.dispatchEvent(d("pause")) : (this.state = "paused", this.em.dispatchEvent(new Event("pause")))
            }
        }, {
            key: "resume",
            value: function() {
                return "paused" !== this.state ? this.em.dispatchEvent(d("resume")) : (this.state = "recording", this.em.dispatchEvent(new Event("resume")))
            }
        }, {
            key: "requestData",
            value: function() {
                return "inactive" === this.state ? this.em.dispatchEvent(d("requestData")) : this.encoder.postMessage(["dump", b.sampleRate])
            }
        }, {
            key: "addEventListener",
            value: function() {
                var e;
                (e = this.em).addEventListener.apply(e, arguments)
            }
        }, {
            key: "removeEventListener",
            value: function() {
                var e;
                (e = this.em).removeEventListener.apply(e, arguments)
            }
        }, {
            key: "dispatchEvent",
            value: function() {
                var e;
                (e = this.em).dispatchEvent.apply(e, arguments)
            }
        }]), e
    }();
    c.prototype.mimeType = "audio/wav", c.isTypeSupported = function(e) {
        return c.prototype.mimeType === e
    }, c.notSupported = !navigator.mediaDevices || !h, c.encoder = j, k = c;
    document.addEventListener("DOMContentLoaded", function() {
        document.getElementById("mode").innerText = "Polyfill on"
    }), window.MediaRecorder = k;
})();
