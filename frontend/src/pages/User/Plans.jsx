import React, { useState, useContext } from 'react';
import useFetch from '../../hooks/useFetch.js';
import { NotificationContext } from '../../context/NotificationContext.jsx';
import { getPlans, subscribe } from '../../services/userService.js';
import styles from '../../styles/dashboard.module.css';

const Plans = () => {
  console.log('Plans component is rendering'); // Debug log
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const { data: plans, loading: plansLoading, error } = useFetch(getPlans);
  const { showNotification } = useContext(NotificationContext);

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      showNotification('Please select a plan first', 'warning');
      return;
    }

    setLoading(true);
    try {
      await subscribe({ planId: selectedPlan._id });
      showNotification('Successfully subscribed to the plan!', 'success');
      setSelectedPlan(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Subscription failed. Please try again.';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  console.log('Plans component - loading:', plansLoading, 'error:', error, 'data:', plans); // Debug log
  
  if (plansLoading) return <div className="loading"><div className="spinner"></div>Loading plans...</div>;
  if (error) return <div className="alert alert-error">Error loading plans: {error}</div>;

  return (
    <div className="container">
      <div className={styles.dashboard}>
        <div className={styles.dashboardHeader}>
          <div>
            <h1 className={styles.dashboardTitle}>Available Plans</h1>
            <p className={styles.dashboardSubtitle}>Choose the perfect plan for your internet needs</p>
          </div>
        </div>

        {/* Plan Comparison */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Plan Comparison</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Feature</th>
                  {plans?.map(plan => (
                    <th key={plan._id} className="text-center">{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">Price</td>
                  {plans?.map(plan => (
                    <td key={plan._id} className="text-center">${plan.price}/month</td>
                  ))}
                </tr>
                <tr>
                  <td className="font-medium">Data Quota</td>
                  {plans?.map(plan => (
                    <td key={plan._id} className="text-center">{plan.quota} GB</td>
                  ))}
                </tr>
                <tr>
                  <td className="font-medium">Download Speed</td>
                  {plans?.map(plan => (
                    <td key={plan._id} className="text-center">{plan.downloadSpeed} Mbps</td>
                  ))}
                </tr>
                <tr>
                  <td className="font-medium">Upload Speed</td>
                  {plans?.map(plan => (
                    <td key={plan._id} className="text-center">{plan.uploadSpeed} Mbps</td>
                  ))}
                </tr>
                <tr>
                  <td className="font-medium">Product Type</td>
                  {plans?.map(plan => (
                    <td key={plan._id} className="text-center">
                      <span className="planType">{plan.productType}</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="font-medium">Contract Length</td>
                  {plans?.map(plan => (
                    <td key={plan._id} className="text-center">{plan.contractLength} months</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans?.map(plan => (
            <div
              key={plan._id}
              className={`${styles.planCard} ${selectedPlan?._id === plan._id ? styles.selected : ''}`}
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="text-center mb-4">
                <span className={styles.planType}>{plan.productType}</span>
                <h3 className={styles.planName}>{plan.name}</h3>
                <div className={styles.planPrice}>
                  <span className="currency">$</span>
                  {plan.price}
                  <span className="text-sm text-gray-500">/month</span>
                </div>
              </div>

              <div className="mb-6">
                <ul className={styles.planFeatures}>
                  <li className={styles.planFeature}>
                    {plan.quota} GB data quota
                  </li>
                  <li className={styles.planFeature}>
                    {plan.downloadSpeed} Mbps download speed
                  </li>
                  <li className={styles.planFeature}>
                    {plan.uploadSpeed} Mbps upload speed
                  </li>
                  <li className={styles.planFeature}>
                    {plan.contractLength} month contract
                  </li>
                  {plan.setupFee > 0 && (
                    <li className={styles.planFeature}>
                      ${plan.setupFee} setup fee
                    </li>
                  )}
                  <li className={styles.planFeature}>
                    Up to {plan.maxUsers} user{plan.maxUsers > 1 ? 's' : ''}
                  </li>
                </ul>
              </div>

              {plan.description && (
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
              )}

              <button
                className={`btn w-full ${selectedPlan?._id === plan._id ? 'btn-success' : 'btn-outline'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlan(plan);
                }}
              >
                {selectedPlan?._id === plan._id ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>

        {/* Subscribe Button */}
        {selectedPlan && (
          <div className="card">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Selected Plan: {selectedPlan.name}</h3>
                <p className="text-gray-600">
                  ${selectedPlan.price}/month • {selectedPlan.quota} GB • {selectedPlan.downloadSpeed} Mbps
                </p>
              </div>
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="btn btn-primary btn-lg"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Subscribing...
                  </>
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Plan Features Details */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Plan Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Fibernet Plans</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• High-speed fiber optic connection</li>
                <li>• Symmetric upload/download speeds</li>
                <li>• Low latency for gaming and streaming</li>
                <li>• Reliable connection with minimal downtime</li>
                <li>• Premium customer support</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Broadband Plans</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Cost-effective copper wire connection</li>
                <li>• Good for basic internet needs</li>
                <li>• Suitable for browsing and email</li>
                <li>• Standard customer support</li>
                <li>• Quick installation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
