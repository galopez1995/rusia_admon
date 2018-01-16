import {Component} from '@angular/core';
import {NavController, NavParams, AlertController} from 'ionic-angular';
import {global} from '../../components/credenciales/credenciales';

declare var OdooApi: any;
@Component({
    selector: 'page-nom-detail',
    templateUrl: 'nom-detail.html',
})
export class NomDetailPage {
    editable = false;
    item;
    cargar = true;
    constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController) {
        this.item = this.navParams.get('item');
        //        console.log(this.item);
        var self = this;
        var odoo = new OdooApi(global.url, global.db);
        odoo.login(global.username, global.password).then(
            function (uid) {
                odoo.search_read('tours.pago.guia', [['semana', '=', self.item.semana]],
                    ['name', 'semana', 'tours_id', 'guia_user_id', 'city_id',
                    'pax_pago', 'total_rub', 'total_eur', 'total_usd', 'total_res', 'total_metro', 'state', 'concepto']).then(
                    function (value2) {

                        console.log(value2);
                        self.item.name = value2[0].name;
                        self.item.semana = value2[0].semana;
                        self.item.tours_id = value2[0].tours_id;
                        self.item.guia_user_id = value2[0].guia_user_id;
                        self.item.city_id = value2[0].city_id;
                        self.item.pax_pago = value2[0].pax_pago;
                        self.item.total_rub = value2[0].total_rub;
                        self.item.total_eur = value2[0].total_eur;
                        self.item.total_usd = value2[0].total_usd;
                        self.item.total_res = value2[0].total_res;
                        self.item.total_metro = value2[0].total_metro;
                        self.item.state = value2[0].state;
                        self.item.concepto = value2[0].concepto;

                    },
                    function () {
                        self.presentAlert('Falla', 'Imposible Conectar');
                    }
                    );

            },
            function () {

            }
        );
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ClienteDetailPage');
    }

    presentAlert(titulo, texto) {
        const alert = this.alertCtrl.create({
            title: titulo,
            subTitle: texto,
            buttons: ['Ok']
        });
        alert.present();
    }

    editar() {

        if (!this.editable) {
            this.editable = true;
        } else {
            this.editable = false;
        }
    }

}
