import {Component} from '@angular/core';
import {NavController, NavParams, AlertController} from 'ionic-angular';
import {global} from '../../components/credenciales/credenciales';
import {CityDetailPage} from '../../pages/city-detail/city-detail';

declare var OdooApi: any;

@Component({
    selector: 'page-clientes',
    templateUrl: 'clientes.html',
})
export class ClientesPage {

    items;
    constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController) {

        var self = this;
        var odoo = new OdooApi(global.url, global.db);
        odoo.login(global.username, global.password).then(
            function (uid) {
                //                odoo.search_read('tours.clientes.email', [['id', '!=', '0']], ['name', 'ilike']).then(
                //                    function (value) {
                //                        console.log(value);
                odoo.search_read('tours.clientes', [['id', '!=', '0']],
                    ['name', 'ilike', 'email', 'telefono', 'nombre_hotel',
                        'active_email', 'is_padrino', 'pago_tarjeta', 'padre', 'observaciones']).then(
                    function (value2) {
                        console.log(value2);
                        self.items = value2
                    },
                    function () {
                        self.presentAlert('Falla', 'Imposible Conectar');
                    }
                    );
                //self.items = valuetours.clientes
                //                    },
                //                    function () {
                //                        self.presentAlert('Falla', 'Imposible Conectar');
                //                    }
                //                );

            },
            function () {

            }
        );
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad CiudadPage');
    }

    presentAlert(titulo, texto) {
        const alert = this.alertCtrl.create({
            title: titulo,
            subTitle: texto,
            buttons: ['Ok']
        });
        alert.present();
    }

    ejecute(item) {

        this.navCtrl.push(CityDetailPage, {item: item});
    }
}
