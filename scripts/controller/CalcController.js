class CalcController {

    constructor() {

        this._audio = new Audio('click.mp3');
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';
        this._displayCalcEl = document.querySelector('#display');
        this._dateEl = document.querySelector('#data');
        this._timeEl = document.querySelector('#hora');
        this._locale = 'pt-BR'
        this._operation = []
        this._currentDate;
        this.initialize();
        this.initButtonsEvent();
        this.initKeyboard();
    }

    //Coloca o horário local e a data na calculadora

    setDisplayDateTime() {

        this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
            day: '2-digit',
            month: "long",
            year: "numeric"
        })

        this.displayTime = this.currentDate.toLocaleTimeString(this._locale)
    }

    //inicializa os displays da calculadora

    initialize() {

        this.setDisplayDateTime();

        setInterval(() => {
            this.setDisplayDateTime();
        }, 1000)

        this.setLastNumberToDisplay();
        this.pasteFromClipboard();

        document.querySelectorAll('.btn-ac').forEach(btn => {

            btn.addEventListener('dblclick', e => {

                this.toggleAudio();
            })
        })
    }

    //Metódo para copiar algo da calculadora

    copyToClipboard() {

        let input = document.createElement('input');
        input.value = this.displayCalc

        document.body.appendChild(input);

        input.select();

        document.execCommand("Copy");

        input.remove();
    }

    //Método para colar uma expressão na calculadora
    pasteFromClipboard() {

        document.addEventListener('paste', e => {

            let text = e.clipboardData.getData('Text');

            this.displayCalc = parseFloat(text);
        });

    }

    //Caso áudio estiver off, após ser clicado no botão 'AC' fica on, e vice e versa.
    toggleAudio() {

        this._audioOnOff = !this._audioOnOff;
    }

    playAudio() {

        if (this._audioOnOff) {

            this._audio.currentTime = 0;
            this._audio.play();

        }
    }

    //Escuta os eventos dos botões clicados pelo usuário

    initButtonsEvent() {

        //Procura os botões dentro do SVG
        let buttons = document.querySelectorAll('#buttons > g , #parts > g');


        //Para cada botão captura um evento de Click ou Drag
        buttons.forEach((btn, index) => {

            this.addEventListenerAll(btn, 'click drag', e => {

                let textBtn = (btn.className.baseVal.replace("btn-", ""));

                //Chama a função que executa o botão
                this.executeButton(textBtn);
            });

            //Modifica o cursor do mouse ao passar em cima de cada botão
            this.addEventListenerAll(btn, 'mouseup mouseover mousedown', e => {

                btn.style.cursor = "pointer";
            })
        });
    }

    //Função para evitar o reuso de vários EventListener diferentes

    addEventListenerAll(element, events, fnc) {

        events.split(' ').forEach(event => {

            element.addEventListener(event, fnc, false)
        });
    }


    //Verifica o botão que o usuário clicou, e chama a operação específica.

    executeButton(n_button) {

        this.playAudio();

        switch (n_button) {

            case 'ac':

                this.clearAll();

                break;

            case 'ce':

                this.clearEntry();

                break;

            case 'soma':

                this.addOperation('+');

                break;

            case 'subtracao':

                this.addOperation('-');

                break;

            case 'divisao':

                this.addOperation('/');

                break;

            case 'multiplicacao':

                this.addOperation('*');

                break;

            case 'porcento':

                this.addOperation('%');
                break;

            case 'igual':

                this.calc();

                break;

            case 'ponto':

                this.addDot();

                break;


            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':

                this.addOperation(parseInt(n_button));

                break;
            default:
                this.setError();
        }
    }

    //Comandos de teclado que o usuário digitar

    initKeyboard() {

        document.addEventListener('keyup', e => {

            this.playAudio();

            switch (e.key) {
                case 'Escape':
                    this.clearAll();
                    break;
                case 'Backspace':
                    this.clearEntry();
                    break;
                case '+':
                case '-':
                case '*':
                case '/':
                case '%':
                    this.addOperation(e.key);
                    break;
                case 'Enter':
                case '=':
                    this.calc();
                    break;
                case '.':
                case ',':
                    this.addDot();
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;

                case 'c':
                    if (e.ctrlKey) this.copyToClipboard();
                    break;

                case 'v':
                    if (e.ctrlKey) this.pasteFromClipboard();
                    break;
            }
        })
    };

    //Método que adiciona valores no array

    addOperation(value) {

        //Substitui o ultimo operador

        if (isNaN(this.getLastOperation())) {


            if (this.isOperator(value)) {

                this.setLastOperation(value)
            }

            else if (isNaN(value)) {

                console.log('Valor estranho')
            }

            //Coloca valor pela primeira vez, pois na primeira vez o array vazio é undefined
            else {
                this.pushOperation(value)

                this.setLastNumberToDisplay()

            }

            //Caso o valor anterior seja um número
        } else {

            if (this.isOperator(value)) {

                this.pushOperation(value);
            }

            //Concatena os valores digitados consecutivamente
            else {

                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation((newValue));

            }

            this.setLastNumberToDisplay()
        }
    }

    //Coloca o valor na última posição do Array
    setLastOperation(value) {

        this._operation[this._operation.length - 1] = value;
    }

    //Retorna o último valor do array

    getLastOperation() {

        return this._operation[this._operation.length - 1];
    }

    //Caso o array passe de 3 elementos

    pushOperation(value) {

        this._operation.push(value)

        if (this._operation.length > 3) {

            this.calc();

        }
    }

    //Faz os cálculos do array


    calc() {

        let last = '';


        this._lastOperator = this.getLastItem()


        //Caso seja clicado o botão de '=' antes de ter 3 itens no array, ele irá calcular conforme o último operador e último número
        if (this._operation.length < 3) {

            let firstItem = this._operation[0];

            this._operation = [firstItem, this._lastOperator, this._lastNumber]
        }

        //Caso sejá clicado no botão de um operador após uma operação, armazena o operador e o resultado da operação
        if (this._operation.length > 3) {

            last = this._operation.pop();

            this._lastNumber = this.getResult();
        }

        //Armazena o último número caso seja clicado o botão de '=' para ser usado na operação acima.

        else if (this._operation.length == 3) {

            this._lastNumber = this.getLastItem(false);
        }

        //Armazena o resultado

        let result = this.getResult()

        //Condição especial caso seja botão 'porcento'

        if (last == '%') {

            result /= 100;

            this._operation = [result];
        }

        else {

            //Coloca o resultado no array
            this._operation = [result]

            //Caso o last não seja nulo ('=' ou '%'), ele coloca no array.
            if (last) this._operation.push(last)
        }

        this.setLastNumberToDisplay()
    }

    //Calcula o array de elementos

    getResult() {

        try {
        return eval(this._operation.join(''));
        }
        catch (e){
            setTimeout(() => this.setError(), 1);
        }

    }

    //Retorna o último item do array, sendo operador caso parâmetro TRUE ou número caso FALSE

    getLastItem(isOperator = true) {

        let lastItem;

        for (let i = this._operation.length - 1; i >= 0; i--) {

            if (this.isOperator(this._operation[i]) == isOperator) {
                lastItem = this._operation[i];
                break;
            }

            //Caso não encontre o último operador ou número (quando clicado em '=' após uma operação)

            if (!lastItem) {

                lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
            }
        }

        return lastItem
    }

    // Colca o último número digitado no display da calculadora
    setLastNumberToDisplay() {

        let lastNumber = this.getLastItem(false);

        if (!lastNumber) lastNumber = 0;

        //Tratar dízimas periódicas e etc.
        if (lastNumber.toString().length > 10) lastNumber = lastNumber.toString().substr(0, 10);

        this.displayCalc = lastNumber;
    }


    //Verifica se o valor é um operador

    isOperator(value) {

        return (['+', '-', '/', '*', '%'].indexOf(value) > -1)
    }

    //Coloca erro na calculadora

    setError() {

        this.displayCalc = "Error";
    }

    //Faz a operação do '.'

    addDot() {

        let lastOperation = this.getLastOperation();

        if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;


        //Coloca "0." caso o usuário coloque o '.' antes de digitar uma operação ou após um operador
        if (this.isOperator(lastOperation) || !lastOperation) {
            this.setLastOperation('0.');
        }

        else {
            this.setLastOperation(lastOperation.toString() + '.');

        }

        this.setLastNumberToDisplay;
    }

    //Caso clicado no botão 'AC' da calculadora (limpa todo array)
    clearAll() {

        this._lastNumber = '';
        this._lastOperator = '';
        this._operation = [];
        this.setLastNumberToDisplay()

    }
    //Caso clicado no botão 'CE' da calculadora (limpa a última entrada)
    clearEntry() {

        this._operation.pop();
        this.setLastNumberToDisplay()

    }


    //Getters and setters para a Data, Hora, e Display da calculadora.
    get displayDate() {

        return this._dateEl.innerHTML;

    }

    set displayDate(value) {

        this._dateEl.innerHTML = value;

    }

    get displayTime() {

        return this._timeEl.innerHTML;

    }

    set displayTime(value) {

        this._timeEl.innerHTML = value;
    }

    get displayCalc() {

        return this._displayCalcEl.innerHTML;

    }

    set displayCalc(value) {

        this._displayCalcEl.innerHTML = value;
    }

    get currentDate() {

        return new Date();

    }

    set currentDate(value) {

        this._currentDate = value;
    }

}