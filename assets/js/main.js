$(function () {
    let lastCount = 0

    hideElms()
    checkUrl()

    $('#count').on('input', function () {
        updateFields($(this).val())
    })

    $('button').click(butt)

    function butt() {
        filled = true

        $('.value').each((id, elm) => {
            if ($(elm).text() == '') {
                filled = false
            }
        })

        if (!filled) {
            return alert('Nevyplnil jsi všechny hodnoty!')
        }

        valid = true

        let text = $(this).text()
        $('.value').each((x, elm) => {
            text = $(elm).text()
            if (
                isNaN(text) &&
                text != '' &&
                (!text.includes(',') ||
                    getCountOfChar(text, ',') > 1 ||
                    (getCountOfChar(text, ',') >= 1 && text.includes('.')))
            ) {
                valid = false
            }
        })

        if (!valid) {
            alert('Některá pole obsahují neplatné hodnoty!')
            return
        }

        let output = ''
        let conc = []
        let abs = []

        $('.value').each((x, elm) => {
            id = $(elm).attr('attr-id')

            if (id > 30) {
                abs[id - 30 - 1] = toNumber($(elm).text())
            } else {
                conc[id - 1] = toNumber($(elm).text())
            }
        })

        let sumx = sum(conc)
        let sumy = sum(abs)
        let sumx2 = sum2(conc)
        let sumx22 = sumx * sumx
        let sumxky = sumxy(conc, abs)
        let n = abs.length

        //Základní sumy
        output += 'Σx = ' + sumx + '<br>'
        output += 'Σy = ' + sumy + '<br>'
        output += 'Σx<sup>2</sup> = ' + sumx2 + '<br>'
        output += 'Σ(x·y) = ' + sumxky + '<br>'

        output += '<br>'
        //b
        output += 'b = (Σx · Σy - n · Σ(x·y))/((Σx)<sup>2</sup> - n · Σx<sup>2</sup>)' + '<br>'
        output += `b = (${sumx} · ${sumy} - ${n} · ${sumxky})/(${sumx22} - ${n} · ${sumx2})<br>`
        b = round((sumx * sumy - n * sumxky) / (sumx22 - n * sumx2))
        output += 'b = ' + b + '<br>'

        output += '<br>'
        //a
        output += 'a = (1/n) · (Σy - b · Σx)' + '<br>'
        output += `a = (1/${n}) · (${sumy} - ${b} · ${sumx})<br>`
        a = round((1 / n) * (sumy - b * sumx))
        output += 'a = ' + a + '<br>'

        output += '<br>'
        //rovnice
        output += 'y = bx + a' + '<br>'
        if (a >= 0) {
        output += `<u>y = ${b}x + ${a}<u><br>`
        } else {
            a = -a
            output += `<u>y = ${b}x - ${a}<u><br>`
        }
        $('#output').html(eto10(decDotToComma(output)))

        let conc_values = 'c:'
        conc.forEach((v, i) => {
            if (i != 0) {
                conc_values += ';'
            }
            conc_values += v
        })

        let abs_values = 'a:'
        abs.forEach((v, i) => {
            if (i != 0) {
                abs_values += ';'
            }
            abs_values += v
        })

        let string = `${conc_values}@${abs_values}@${n}`
        let base64 = LZString.compressToBase64(string)

        let link = window.location.origin + window.location.pathname + '?' + base64

        $("input[type='text']").val(link)

        $('p#share').show()
        $('input#link').show()
    }

    $(document).on('input', '.value', function () {
        let text = $(this).text()

        if (
            isNaN(text) &&
            text != '' &&
            (!text.includes(',') ||
                getCountOfChar(text, ',') > 1 ||
                (getCountOfChar(text, ',') >= 1 && text.includes('.')))
        ) {
            alert('Zadej prosím číslo!')
        }

        checkFields()
    })

    $(document).on('keypress', '.value', function (ev) {
        if (ev.originalEvent.keyCode == '13') {
            ev.preventDefault()
            let elmId = parseInt($(this).attr('attr-id'))
            let id = elmId + 1

            if ($(".value[attr-id='" + id + "']").length == 0) {
                if (elmId > 30) id = 1
                else id = 31
            }

            if ($(".value[attr-id='" + id + "']").length == 0) {
                alert('Nepovedlo se přejít na další pole.')
                return
            }

            $(".value[attr-id='" + id + "']").focus()
        }
    })

    $('input#link').click(function () {
        $(this).select()
        document.execCommand('copy')
    })

    function updateFields(count) {
        if (count > 30) {
            alert('Zadáváš moc hodnot!')
            $('#count').val(0)
            hideElms()
            return clearElms()
        }
        if (count < 0) {
            alert('Záporné číslo není povoleno!')
            $('#count').val(0)
            hideElms()
            return clearElms()
        }

        let arr = []
        let maxFilledValue = 0

        $('.value').each((x, elm) => {
            id = parseInt($(elm).attr('attr-id'))
            if (id > 30) {
                id = id - 30
            }

            if ($(elm).text() != '') {
                arr[$(elm).attr('attr-id')] = $(elm).text()
                if (id > maxFilledValue) {
                    maxFilledValue = id
                }
            }
        })

        if (maxFilledValue > count) {
            if (!confirm('Chystáte se smazat již některé vložené hodnoty, chcete pokračovat?')) {
                $('#count').val(lastCount)
                return
            }
        }

        clearElms()

        if (count == 0) {
            hideElms()
        } else {
            showElms()
        }

        for (let i = 0; i < count; i++) {
            $('#konc.values').append('<div attr-id="' + (i + 1) + '" class="value" contenteditable="true"></div>')
            $('#abs.values').append('<div attr-id="' + (i + 31) + '" class="value" contenteditable="true"></div>')
        }

        for (let l = 0; l < arr.length; l++) {
            if (arr[l] != '') {
                $(".value[attr-id='" + l + "'").text(arr[l])
            }
        }

        lastCount = count

        checkFields()
    }

    function clearElms() {
        $('.value').each((l, elm) => {
            elm.remove()
        })
    }

    function showElms() {
        $('p.group-title').show()
        $('div.values').show()
        $('button').show()
    }
    function hideElms() {
        $('p.group-title').hide()
        $('div.values').hide()
        $('button').hide()
        $('p#share').hide()
        $('input#link').hide()
    }

    function getCountOfChar(text, char) {
        return text.split(char).length - 1
    }

    function toNumber(text) {
        return parseFloat(text.replaceAll(',', '.'))
    }

    function sum(arr) {
        let r = 0
        arr.forEach((v) => {
            r += v
        })
        return r
    }

    function sum2(arr) {
        let r = 0
        arr.forEach((v) => {
            r += v * v //v^2
        })
        return r
    }

    function sumxy(arr1, arr2) {
        let r = 0
        for (let i = 0; i < arr1.length; i++) {
            r += arr1[i] * arr2[i] //x * y
        }
        return r
    }

    function checkFields() {
        filled = true

        $('.value').each((id, elm) => {
            if ($(elm).text() == '') {
                filled = false
            }
        })

        if (filled) {
            $('button').removeAttr('disabled')
        } else {
            $('button').attr('disabled', '')
        }
    }

    function round(float) {
        return parseFloat(float.toFixed(8))
    }

    function decDotToComma(number) {
        return number.toString().replaceAll('.', ',')
    }

    function eto10(number) {
        return number.toString().replaceAll('e', '·10^')
    }

    function checkUrl() {
        string = window.location.search
        if (string == '?' || string == '') return
        base64 = string.substring(1)
        try {
            data = LZString.decompressFromBase64(base64)
        } catch (e) {
            return
        }

        if (data == '' || data == null) {
            try {
                data = atob(base64)
            } catch (e) {
                return
            }
        }

        let ex = data.split('@')
        if (ex.length != 3) {
            data = atob(base64)
            ex = data.split('@')
            if (ex.length != 3) return
        }

        if (!ex[0].includes('c:')) return
        if (!ex[1].includes('a:')) return
        if (isNaN(ex[2]) || ex[2] == '') return

        let conc = ex[0].substring(2)
        let abs = ex[1].substring(2)
        let n = parseInt(ex[2])

        conc = conc.split(';')
        abs = abs.split(';')

        if (conc.length != abs.length && conc.length != n && abs.length != n) return

        updateFields(n)
        $('#count').val(n)

        conc.forEach((v, i) => {
            $("#konc.values .value[attr-id='" + (i + 1) + "']").text(v)
        })

        abs.forEach((v, i) => {
            $("#abs.values .value[attr-id='" + (i + 31) + "']").text(v)
        })

        checkFields()

        butt()
    }
})
