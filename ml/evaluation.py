"""
Machine Learning Evaluation Module.
Generates comprehensive evaluation statistics, comparison metrics,
confusion matrices, and classification reports for academic project presentation.
"""
import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from preprocessing import load_crop_data, prepare_crop_data

def generate_full_evaluation_report():
    models_dir = os.path.abspath(
        os.path.join(os.path.dirname(__file__), '..', 'saved_models')
    )
    metrics_path = os.path.join(models_dir, 'crop_metrics.json')

    if not os.path.exists(metrics_path):
        from crop_model import train_and_evaluate_crop_models
        _, metrics = train_and_evaluate_crop_models(models_dir)
    else:
        with open(metrics_path, 'r') as f:
            metrics = json.load(f)

    print("=" * 65)
    print("      CROP PREDICTION SYSTEM - MODEL EVALUATION SUMMARY")
    print("=" * 65)
    print(f"Dataset Size:          {metrics['dataset']['total_samples']} samples")
    print(f"Number of Crops:       {metrics['dataset']['num_classes']}")
    print(f"Selected Best Model:   {metrics['best_model']['name']}")
    print(f"Best Test Accuracy:    {metrics['best_model']['test_accuracy'] * 100:.2f}%\n")

    print("-" * 65)
    print(f"{'Metric':<25} | {'Random Forest':<15} | {'Decision Tree':<15}")
    print("-" * 65)
    rf = metrics['comparison']['random_forest']
    dt = metrics['comparison']['decision_tree']
    print(f"{'Train Accuracy':<25} | {rf['train_accuracy']*100:.2f}%{'':<9} | {dt['train_accuracy']*100:.2f}%")
    print(f"{'Test Accuracy':<25}  | {rf['test_accuracy']*100:.2f}%{'':<9} | {dt['test_accuracy']*100:.2f}%")
    print(f"{'Precision (Weighted)':<25} | {rf['precision']:.4f}{'':<9} | {dt['precision']:.4f}")
    print(f"{'Recall (Weighted)':<25} | {rf['recall']:.4f}{'':<9} | {dt['recall']:.4f}")
    print(f"{'F1 Score (Weighted)':<25} | {rf['f1_score']:.4f}{'':<9} | {dt['f1_score']:.4f}")
    print("-" * 65)

    print("\nFeature Importances (Random Forest):")
    for feat, imp in sorted(metrics['best_model']['feature_importances'].items(), key=lambda x: x[1], reverse=True):
        bar = "█" * int(imp * 100)
        print(f"  {feat:<12} : {imp:.4f} {bar}")

    return metrics

if __name__ == '__main__':
    generate_full_evaluation_report()
