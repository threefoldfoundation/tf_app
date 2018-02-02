import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ITffState } from './states/tff.state';

export const getTffState = createFeatureSelector<ITffState>('tff');

export const getOrders = createSelector(getTffState, s => s.orders);
export const getNodeOrdersQuery = createSelector(getTffState, s => s.ordersQuery);
export const getOrdersStatus = createSelector(getTffState, s => s.ordersStatus);
export const getOrder = createSelector(getTffState, s => s.order);
export const getOrderStatus = createSelector(getTffState, s => s.orderStatus);
export const createOrderStatus = createSelector(getTffState, s => s.createOrderStatus);
export const updateOrderStatus = createSelector(getTffState, s => s.updateOrderStatus);
export const getInvestmentAgreements = createSelector(getTffState, s => s.investmentAgreements);
export const getInvestmentAgreementsQuery = createSelector(getTffState, s => s.investmentAgreementsQuery);
export const getInvestmentAgreementsStatus = createSelector(getTffState, s => s.investmentAgreementsStatus);
export const getInvestmentAgreement = createSelector(getTffState, s => s.investmentAgreement);
export const getInvestmentAgreementStatus = createSelector(getTffState, s => s.investmentAgreementStatus);
export const updateInvestmentAgreementStatus = createSelector(getTffState, s => s.updateInvestmentAgreementStatus);
export const createInvestmentAgreementStatus = createSelector(getTffState, s => s.createInvestmentAgreementStatus);
export const getGlobalStatsList = createSelector(getTffState, s => s.globalStatsList);
export const getGlobalStatsListStatus = createSelector(getTffState, s => s.globalStatsListStatus);
export const getGlobalStats = createSelector(getTffState, s => s.globalStats);
export const getGlobalStatsStatus = createSelector(getTffState, s => s.globalStatsStatus);
export const updateGlobalStatsStatus = createSelector(getTffState, s => s.updateGlobalStatsStatus);

export const getUserList = createSelector(getTffState, s => s.userList);
export const getUserQueryList = createSelector(getTffState, s => s.userListQuery);
export const getUserListStatus = createSelector(getTffState, s => s.userListStatus);
export const getUser = createSelector(getTffState, s => s.user);
export const getUserStatus = createSelector(getTffState, s => s.userStatus);
export const getTffProfile = createSelector(getTffState, s => s.tffProfile);
export const getTffProfileStatus = createSelector(getTffState, s => s.tffProfileStatus);
export const setKYCStatus = createSelector(getTffState, s => s.setKYCStatus);

export const getBalance = createSelector(getTffState, s => s.balance);
export const getBalanceStatus = createSelector(getTffState, s => s.balanceStatus);
export const getUserTransactions = createSelector(getTffState, s => s.userTransactions);
export const getUserTransactionsStatus = createSelector(getTffState, s => s.userTransactionsStatus);
export const createTransactionStatus = createSelector(getTffState, s => s.createTransactionStatus);

export const getAgendaEvents = createSelector(getTffState, s => s.agendaEvents);
export const getAgendaEventsStatus = createSelector(getTffState, s => s.agendaEventsStatus);
export const getAgendaEvent = createSelector(getTffState, s => s.agendaEvent);
export const getAgendaEventStatus = createSelector(getTffState, s => s.agendaEventStatus);
export const createAgendaEventStatus = createSelector(getTffState, s => s.createAgendaEventStatus);
export const updateAgendaEventStatus = createSelector(getTffState, s => s.updateAgendaEventStatus);
export const getEventParticipants = createSelector(getTffState, s => s.eventParticipants);
export const getEventParticipantsStatus = createSelector(getTffState, s => s.eventParticipantsStatus);

export const getKYCChecks = createSelector(getTffState, s => s.kycChecks);
export const getKYCChecksStatus = createSelector(getTffState, s => s.kycChecksStatus);
export const verifyUtilityBillStatus = createSelector(getTffState, s => s.verifyUtilityBillStatus);

export const getDistinctFlows = createSelector(getTffState, s => s.distinctFlows);
export const getDistinctFlowsStatus = createSelector(getTffState, s => s.distinctFlowsStatus);
export const getFlowRuns = createSelector(getTffState, s => s.flowRuns);
export const getFlowRunsStatus = createSelector(getTffState, s => s.flowRunsStatus);
export const getFlowRun = createSelector(getTffState, s => s.flowRun);
export const getFlowRunStatus = createSelector(getTffState, s => s.flowRunStatus);
export const getFlowStats = createSelector(getTffState, s => s.flowStats);
export const getFlowStatsStatus = createSelector(getTffState, s => s.flowStatsStatus);

export const getInstallations = createSelector(getTffState, s => s.installations);
export const getInstallationsStatus = createSelector(getTffState, s => s.installationsStatus);
export const getInstallation = createSelector(getTffState, s => s.installation);
export const getInstallationStatus = createSelector(getTffState, s => s.installationStatus);
export const getInstallationLogs = createSelector(getTffState, s => s.installationLogs);
export const getInstallationLogsStatus = createSelector(getTffState, s => s.installationLogsStatus);
