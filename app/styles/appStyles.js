import { StyleSheet } from 'react-native';
export const appStyles = StyleSheet.create({
  titleHeader: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#E5E5E5',
  },
  totalBalanceText: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#E5E5E5',
  },
  topUpText: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  balanceText: {
    fontSize: 46,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  viewAllText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#E5E5E5',
  },
  infoTrendHeaderText: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#D9D9D9',
  },
  infoPriceHeaderText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#D9D9D9',
  },
  allCurrenciesText: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#EEEEEE',
  },
  currencyNameAndPriceText: {
    fontSize: 20,
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
  },
  currencyChangeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
  },
  emptyListText: {
    textAlign: 'center', padding: 20, color: 'gray'
  },

  topUpButton: {
    width: 115,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#83EDA6',
    borderRadius: 10,
  },
  viewAllButton: {
    width: 130,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#636363',
    borderRadius: 10,
  },

  flexContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#3C3C3C',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  containerWithoutPadding: {
    flex: 1,
    backgroundColor: '#3C3C3C',
    paddingTop: 30,
  },
  balanceContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  totalBalanceContainer: {},
  viewAllContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  bottomBarContainer: {
    widht: '100%',
    height: 100,
    backgroundColor: '#636363',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  infoTrendHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 35,
    paddingHorizontal: 15,
  },
  trendHeaderContainer: {
    width: '100%',
    height: 460,
    borderRadius: 10,
    backgroundColor: '#636363',
  },
  upperTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',     
    alignItems: 'center',
    height: 50,
    position: 'relative',
  },
  paymentMethodContainer: {
    width: 290,
    height: 80,
    backgroundColor: '#3C3C3C', 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#636363', 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  currencyChangePositiveContainer: {
    width: 55,
    height: 30,
    marginBottom: 5,
    backgroundColor: '#83EDA6',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyChangeNegativeContainer: {
    width: 55,
    height: 30,
    marginBottom: 5,
    backgroundColor: '#EB5B5B',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topUpContinueButton: {
    width: 230,
    height: 50,
    backgroundColor: '#83EDA6',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 260,
    position: '',
  },

  title: {
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#EEEEEE',
  },
  backButton: {
    position: 'absolute',
    left: 10,
    padding: 10, 
  }
});
