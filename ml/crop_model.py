"""
Machine Learning Model Training and Evaluation for Crop Recommendation.
Trains both Random Forest Classifier and Decision Tree Classifier on the genuine 2200-sample dataset,
evaluates performance, compares models, and serializes the best performing model.
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

from preprocessing import load_crop_data, analyze_dataset, prepare_crop_data

def train_and_evaluate_crop_models(save_dir=None):
    """
    Train and evaluate Random Forest and Decision Tree classifiers for Crop Recommendation.
    Saves models and metrics to save_dir.
    """
    if save_dir is None:
        save_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), '..', 'saved_models')
        )
    os.makedirs(save_dir, exist_ok=True)

    print("=" * 60)
    print("STEP 1: Loading Crop Dataset and Exploratory Analysis")
    print("=" * 60)
    df = load_crop_data()
    eda_stats = analyze_dataset(df)
    print(f"Total samples: {eda_stats['total_samples']}")
    print(f"Features: {eda_stats['total_features']}")
    print(f"Classes ({eda_stats['num_classes']}): {', '.join(eda_stats['classes'][:8])}...")
    print(f"Missing values: {eda_stats['missing_values']}")

    print("\n" + "=" * 60)
    print("STEP 2: Preparing Train-Test Split (80/20 Stratified)")
    print("=" * 60)
    (
        X_train, X_test,
        X_train_scaled, X_test_scaled,
        y_train, y_test,
        scaler, feature_names
    ) = prepare_crop_data(df, test_size=0.2, random_state=42)

    print(f"Training set: {X_train.shape[0]} samples")
    print(f"Testing set:  {X_test.shape[0]} samples")

    # 1. Train Decision Tree Classifier
    print("\n" + "=" * 60)
    print("STEP 3: Training Decision Tree Classifier")
    print("=" * 60)
    dt_model = DecisionTreeClassifier(criterion='entropy', max_depth=15, min_samples_split=4, random_state=42)
    dt_model.fit(X_train, y_train)

    dt_y_pred_train = dt_model.predict(X_train)
    dt_y_pred_test = dt_model.predict(X_test)

    dt_acc_train = accuracy_score(y_train, dt_y_pred_train)
    dt_acc_test = accuracy_score(y_test, dt_y_pred_test)
    dt_prec = precision_score(y_test, dt_y_pred_test, average='weighted', zero_division=0)
    dt_rec = recall_score(y_test, dt_y_pred_test, average='weighted', zero_division=0)
    dt_f1 = f1_score(y_test, dt_y_pred_test, average='weighted', zero_division=0)

    print(f"Decision Tree - Train Accuracy: {dt_acc_train * 100:.2f}%")
    print(f"Decision Tree - Test Accuracy:  {dt_acc_test * 100:.2f}%")
    print(f"Decision Tree - F1 Score:       {dt_f1:.4f}")

    # 2. Train Random Forest Classifier
    print("\n" + "=" * 60)
    print("STEP 4: Training Random Forest Classifier")
    print("=" * 60)
    rf_model = RandomForestClassifier(n_estimators=100, criterion='gini', random_state=42, n_jobs=-1)
    rf_model.fit(X_train, y_train)

    rf_y_pred_train = rf_model.predict(X_train)
    rf_y_pred_test = rf_model.predict(X_test)

    rf_acc_train = accuracy_score(y_train, rf_y_pred_train)
    rf_acc_test = accuracy_score(y_test, rf_y_pred_test)
    rf_prec = precision_score(y_test, rf_y_pred_test, average='weighted', zero_division=0)
    rf_rec = recall_score(y_test, rf_y_pred_test, average='weighted', zero_division=0)
    rf_f1 = f1_score(y_test, rf_y_pred_test, average='weighted', zero_division=0)

    print(f"Random Forest - Train Accuracy: {rf_acc_train * 100:.2f}%")
    print(f"Random Forest - Test Accuracy:  {rf_acc_test * 100:.2f}%")
    print(f"Random Forest - F1 Score:       {rf_f1:.4f}")

    # Feature Importances from Random Forest
    feat_importances = dict(zip(feature_names, [round(float(v), 4) for v in rf_model.feature_importances_]))
    print(f"Feature Importances: {feat_importances}")

    # Model comparison
    best_name = "Random Forest Classifier" if rf_acc_test >= dt_acc_test else "Decision Tree Classifier"
    best_model = rf_model if rf_acc_test >= dt_acc_test else dt_model
    best_y_pred = rf_y_pred_test if rf_acc_test >= dt_acc_test else dt_y_pred_test

    print("\n" + "=" * 60)
    print(f"STEP 5: Selected Best Model: {best_name}")
    print("=" * 60)

    classes = sorted(df['label'].unique().tolist())
    cls_report = classification_report(y_test, best_y_pred, target_names=classes, output_dict=True)
    conf_mat = confusion_matrix(y_test, best_y_pred, labels=classes).tolist()

    # Save models
    rf_path = os.path.join(save_dir, 'crop_rf_model.joblib')
    dt_path = os.path.join(save_dir, 'crop_dt_model.joblib')
    best_path = os.path.join(save_dir, 'crop_best_model.joblib')
    scaler_path = os.path.join(save_dir, 'crop_scaler.joblib')

    joblib.dump(rf_model, rf_path)
    joblib.dump(dt_model, dt_path)
    joblib.dump(best_model, best_path)
    joblib.dump(scaler, scaler_path)
    print(f"Saved models to: {save_dir}")

    # Compile metrics
    metrics = {
        'dataset': {
            'total_samples': len(df),
            'features': feature_names,
            'classes': classes,
            'num_classes': len(classes)
        },
        'comparison': {
            'random_forest': {
                'model_name': 'Random Forest Classifier',
                'parameters': {'n_estimators': 100, 'criterion': 'gini'},
                'train_accuracy': round(float(rf_acc_train), 4),
                'test_accuracy': round(float(rf_acc_test), 4),
                'precision': round(float(rf_prec), 4),
                'recall': round(float(rf_rec), 4),
                'f1_score': round(float(rf_f1), 4),
            },
            'decision_tree': {
                'model_name': 'Decision Tree Classifier',
                'parameters': {'criterion': 'entropy', 'max_depth': 15},
                'train_accuracy': round(float(dt_acc_train), 4),
                'test_accuracy': round(float(dt_acc_test), 4),
                'precision': round(float(dt_prec), 4),
                'recall': round(float(dt_rec), 4),
                'f1_score': round(float(dt_f1), 4),
            }
        },
        'best_model': {
            'name': best_name,
            'test_accuracy': round(float(rf_acc_test if best_name == 'Random Forest Classifier' else dt_acc_test), 4),
            'feature_importances': feat_importances,
            'classes': classes
        },
        'classification_report': cls_report,
        'confusion_matrix': conf_mat
    }

    metrics_path = os.path.join(save_dir, 'crop_metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    print(f"Saved metrics report to: {metrics_path}")

    return best_model, metrics

if __name__ == '__main__':
    train_and_evaluate_crop_models()
