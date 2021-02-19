//ativa ou desativa o modal
const Modal = {
    open(){
        document.querySelector('.modal-overlay').classList.add('active')
        document.querySelector('.footer').classList.add('invisiblefooter')
    },
    close(){
        document.querySelector('.modal-overlay').classList.remove('active')
        Form.clearFields()
        document.querySelector('.footer').classList.remove('invisiblefooter')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("My.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("My.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transactions) {
        Transaction.all.push(transactions)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        //somar as entradas
        let income = 0
        Transaction.all.forEach(transactions => {
            if (transactions.amount > 0) {
                income += transactions.amount
            }
        })
        return income
    },

    expenses() {
        //somar as saídas
        let expense = 0
        Transaction.all.forEach(transactions => {
            if (transactions.amount < 0) {
                expense += transactions.amount
            }
        })
        return expense
    },

    total() {
        //entradas - saídas
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    //seleciona a tabela e seu corpo
    transactionsContainer: document.querySelector('#data-table tbody'),

    //adiciona uma nova transação
    addTransaction (transactions, index) {
        const creatTr = document.createElement('tr')
        creatTr.innerHTML = DOM.innerHTMLTransaction(transactions)
        creatTr.dataset.index = index

        DOM.transactionsContainer.appendChild(creatTr)
    },

    innerHTMLTransaction (transactions, index) {
        //verifica se é entrada ou saída
        const cssClass = transactions.amount > 0 ? 'income' : 'expense'

        const amount = utils.formatCurrency(transactions.amount)

        //coloca no HTML
        const html = `
        <td class="description">${transactions.description}</td>
        <td class="${cssClass}">${amount}</td>
        <td class="date">${transactions.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="../../public/assets/minus.svg" alt="Remover Transação"  style="cursor: pointer;">
        </td>
        `
        return html
    },

    updateBalance () {
        document.getElementById('incomeDisplay').innerHTML = utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = utils.formatCurrency(Transaction.total())
    },

    //Limpa os elementos
    clearTransactions () {
        DOM.transactionsContainer.innerHTML = ""
    }
}

//formata a moeda
const utils = {
    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[2]}`
    },

    formatAmount(value) {
        value = Number(value.replace(/\,\./g, "")) * 100

        return value
    },

    formatCurrency (value) {
        const signal = Number(value) < 0 ? '-' : ''

        value = String(value).replace(/\-/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    formatData() {
        let {description, amount, date} = Form.getValues()
        amount = utils.formatAmount(amount)
        date = utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    validateFields() {
        const {description, amount, date} = Form.getValues()

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos corretamente.")
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()

            const transaction = Form.formatData()

            //adicionar uma transação
            Transaction.add(transaction)

            //limpar os campos do form
            Form.clearFields()

            //fecha a janela que se abre
            Modal.close()

        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach((transactions) => {
            DOM.addTransaction(transactions)
        })
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()

