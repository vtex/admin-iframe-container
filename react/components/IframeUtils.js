import PropTypes from 'prop-types'
import Cookies from 'js-cookie'
import axios from 'axios'

let isPricingV2Active =
  (window &&
    window.localStorage &&
    window.localStorage.getItem('routePriceSheetFromS3')) ||
  null

const getEnv = () => Cookies.get('vtex-commerce-env') || 'stable'

export const stopLoading = () =>
  window.postMessage({ action: { type: 'STOP_LOADING' } }, '*')
export const startLoading = () =>
  window.postMessage({ action: { type: 'START_LOADING' } }, '*')

export async function checkPricingVersion() {
  // isPricingV2Active oneOf[true,false,null]
  // true => pricing v2 (hide the sku price table)
  // false => pricing v1 (should have sku price table on legacy tabs)
  // null => request failed or localStorage is empty
  if (isPricingV2Active === null) {
    const res = await axios('/api/pricing/pvt/api-configuration')

    isPricingV2Active = (res.data && res.data.routePriceSheetFromS3) || null
    localStorage.setItem('routePriceSheetFromS3', isPricingV2Active)
  }
}

export function componentDidMount() {
  const { emitter } = this.context

  startLoading()
  emitter.on('localesChanged', this.updateChildLocale)
  this.setState({ loaded: true })
}

export function componentWillUnmount() {
  const { emitter } = this.context

  emitter.off('localesChanged', this.updateChildLocale)
}

const DELOREAN_REGISTRY = [
  'billing',
  'bridge',
  'checkout',
  'creditcontrol',
  'fms',
  'fms-picking',
  'io-vtex-loader',
  'license-manager',
  'logistics',
  'message-center',
  'myaccount',
  'payment-provider',
  'pci-gateway',
  'picking',
  'portal',
  'pricing',
  'rnb',
  'suggestions',
  'suggestion',
  'suggestions/catalog-mapping',
  'suggestion/catalog-mapping',
  'surveys',
  'vtexid',
  'vtable',
]

function handleRef(iframe) {
  this.iframe = iframe
}

function updateChildLocale(locale) {
  const message = { action: { type: 'LOCALE_SELECTED', payload: locale } }

  this.iframe.contentWindow.postMessage(message, '*')
}

const contextTypes = {
  account: PropTypes.string,
  culture: PropTypes.object,
  emitter: PropTypes.object,
  navigate: PropTypes.func,
}

const propTypes = {
  params: PropTypes.object,
}

const getLegacyHeaderTabs = pathName => {
  let tabs
  let title

  switch (pathName.toLowerCase()) {
    // IMPORT & EXPORT SECTION
    case '/admin/site/relatorio_skus.aspx':

    case '/admin/site/produtoexportacaoimportacaoespecificacaov2.aspx':

    case '/admin/site/produtoexportacaoimportacaoespecificacaoskuv2.aspx':

    case '/admin/site/skutabelavalor.aspx':

    case '/admin/site/gerarimagens.aspx':

    case '/admin/site/produtoimagemexportacao.aspx':

    case '/admin/site/produtoexportacaoimportacaoavaliacao.aspx':
      title = 'appframe.navigation.catalog.importExport'
      tabs = [
        {
          label: 'appframe.navigation.catalog.importExport.products',
          path: '/admin/Site/Relatorio_Skus.aspx',
          active: pathName.includes('Relatorio_Skus.aspx'),
        },
        {
          label:
            'appframe.navigation.catalog.importExport.productSpecification',
          path: '/admin/Site/ProdutoExportacaoImportacaoEspecificacaoV2.aspx',
          active: pathName.includes(
            'ProdutoExportacaoImportacaoEspecificacaoV2.aspx'
          ),
        },
        {
          label: 'appframe.navigation.catalog.importExport.skuSpecification',
          path:
            '/admin/Site/ProdutoExportacaoImportacaoEspecificacaoSKUV2.aspx',
          active: pathName.includes(
            'ProdutoExportacaoImportacaoEspecificacaoSKUV2.aspx'
          ),
        },
        {
          label: 'appframe.navigation.catalog.importExport.importImages',
          path: '/admin/Site/gerarimagens.aspx',
          active: pathName.includes('gerarimagens.aspx'),
        },
        {
          label: 'appframe.navigation.catalog.importExport.exportImages',
          path: '/admin/Site/ProdutoImagemExportacao.aspx',
          active: pathName.includes('ProdutoImagemExportacao.aspx'),
        },
        {
          label:
            'appframe.navigation.catalog.importExport.exportProductreviews',
          path: '/admin/Site/ProdutoExportacaoImportacaoAvaliacao.aspx',
          active: pathName.includes(
            'ProdutoExportacaoImportacaoAvaliacao.aspx'
          ),
        },
      ]
      if (!isPricingV2Active) {
        tabs.push({
          label: 'appframe.navigation.catalog.importExport.skuPriceList',
          path: '/admin/Site/SkuTabelaValor.aspx',
          active: pathName.includes('SkuTabelaValor.aspx'),
        })
      }

      break

    // SETTINGS SECTION
    case '/admin/site/configform.aspx':

    case '/admin/site/configseocontents.aspx':

    case '/admin/site/textosite.aspx':

    case '/admin/site/tipoarquivo.aspx':

    case '/admin/site/geographicregion.aspx':
      title = 'appframe.navigation.cms.settings'
      tabs = [
        {
          label: 'appframe.navigation.cms.settings.general',
          path: '/admin/Site/ConfigForm.aspx',
          active: pathName.includes('ConfigForm.aspx'),
        },
        {
          label: 'appframe.navigation.cms.settings.seo',
          path: '/admin/Site/ConfigSEOContents.aspx',
          active: pathName.includes('ConfigSEOContents.aspx'),
        },
        {
          label: 'appframe.navigation.cms.settings.text',
          path: '/admin/Site/TextoSite.aspx',
          active: pathName.includes('TextoSite.aspx'),
        },
        {
          label: 'appframe.navigation.cms.settings.fileTypes',
          path: '/admin/Site/TipoArquivo.aspx',
          active: pathName.includes('TipoArquivo.aspx'),
        },
        {
          label: 'appframe.navigation.cms.settings.geographicalAreas',
          path: '/admin/Site/GeographicRegion.aspx',
          active: pathName.includes('GeographicRegion.aspx'),
        },
      ]
      break

    // REPORTS SECTION
    case '/admin/site/relatorioindexacao.aspx':

    case '/admin/site/relatorio_seguranca.aspx':

    case '/admin/site/giftlist.aspx':

    case '/admin/site/relatorio_avisemesku.aspx':

    case '/admin/site/relatorionews.aspx':

    case '/admin/site/resenha.aspx':

    case '/admin/site/linksrelatorios.aspx':
      title = 'appframe.navigation.catalog.reports'
      tabs = [
        {
          label: 'appframe.navigation.catalog.reports.indexed',
          path: '/admin/Site/RelatorioIndexacao.aspx',
          active: pathName.includes('RelatorioIndexacao.aspx'),
        },
        {
          label: 'appframe.navigation.catalog.reports.security',
          path: '/admin/Site/Relatorio_Seguranca.aspx',
          active: pathName.includes('Relatorio_Seguranca.aspx'),
        },
        {
          label: 'appframe.navigation.catalog.reports.giftLists',
          path: '/admin/Site/GiftList.aspx',
          active: pathName.includes('GiftList.aspx'),
        },
        {
          label: 'appframe.navigation.catalog.reports.onHold',
          path: '/admin/Site/Relatorio_AviseMeSku.aspx',
          active: pathName.includes('Relatorio_AviseMeSku.aspx'),
        },
        {
          label: 'appframe.navigation.catalog.reports.newsletter',
          path: '/admin/Site/RelatorioNews.aspx',
          active: pathName.includes('RelatorioNews.aspx'),
        },
        {
          label: 'appframe.navigation.catalog.reports.reviews',
          path: '/admin/Site/Resenha.aspx',
          active: pathName.includes('Resenha.aspx'),
        },
        {
          label: 'appframe.navigation.catalog.reports.history',
          path: '/admin/Site/LinksRelatorios.aspx',
          active: pathName.includes('LinksRelatorios.aspx'),
        },
      ]
      break

    // ATTACHMENT SECTION
    case '/admin/site/anexo.aspx':

    case '/admin/site/skuservicotipo.aspx':

    case '/admin/site/skuservicovalor.aspx':

    case '/admin/site/skuvincularvalorservico.aspx':
      title = 'appframe.navigation.catalog.attachments'
      tabs = [
        {
          label: 'appframe.navigation.catalog.attachments.register',
          path: '/admin/Site/Anexo.aspx',
          active: pathName.includes('Anexo.aspx'),
        },
        {
          label: 'appframe.navigation.catalog.attachments.types',
          path: '/admin/Site/SkuServicoTipo.aspx',
          active: pathName.includes('SkuServicoTipo.aspx'),
        },
        {
          label: 'appframe.navigation.catalog.attachments.values',
          path: '/admin/Site/SkuServicoValor.aspx',
          active: pathName.includes('SkuServicoValor.aspx'),
        },
        {
          label: 'appframe.navigation.catalog.attachments.linkServices',
          path: '/admin/Site/SkuVincularValorServico.aspx',
          active: pathName.includes('SkuVincularValorServico.aspx'),
        },
      ]
      break

    case '/admin/site/giftlisttype.aspx':
      title = 'appframe.navigation.cms.settings.listTypes'
      tabs = []
      break

    case '/admin/site/categories.aspx':

    case '/admin/site/categoriaform.aspx':
      title = 'appframe.navigation.catalog.categories'
      tabs = []
      break

    case '/admin/site/marca.aspx':

    case '/admin/site/marcaform.aspx':
      title = 'appframe.navigation.catalog.brands'
      tabs = []
      break

    case '/admin/site/store.aspx':
      title = 'appframe.navigation.channel'
      tabs = []
      break

    case '/admin/site/vale.aspx':
      title = 'appframe.navigation.vouchers'
      tabs = []
      break

    case '/admin/site/seller.aspx':
      title = 'appframe.navigation.sellerManagement.title'
      tabs = []
      break

    case '/admin/site/skuseller.aspx':
      title = 'appframe.navigation.SKUbinding'
      tabs = []
      break

    case '/admin/site/produto.aspx':
      title = 'appframe.navigation.catalog.products'
      tabs = []
      break

    case '/admin/site/xml.aspx':
      title = 'appframe.navigation.catalog.xml'
      tabs = []
      break

    case '/admin/site/skucondicaocomercial.aspx':
      title = 'appframe.navigation.catalog.commercialCondition'
      tabs = []
      break

    case '/admin/site/fornecedor.aspx':
      title = 'appframe.navigation.catalog.suppliers'
      tabs = []
      break

    case '/admin/site/skukit.aspx':
      title = 'appframe.navigation.catalog.sku-bundle'
      tabs = []
      break

    case '/admin/site/skukitform.aspx':
      title = 'appframe.navigation.catalog.manage-sku-bundle'
      tabs = []
      break

    case '/admin/a':

    case '/admin/a/':
      title = 'appframe.navigation.cms.pageHeader'
      tabs = []
      break

    default:
      title = 'appframe.navigation.catalog.title'
      tabs = []
      break
  }

  return { tabs, title }
}

export {
  getEnv,
  updateChildLocale,
  handleRef,
  contextTypes,
  propTypes,
  getLegacyHeaderTabs,
  DELOREAN_REGISTRY,
}
