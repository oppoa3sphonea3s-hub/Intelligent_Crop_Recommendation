"""
Data preprocessing utilities for crop and fertilizer recommendation datasets.
"""
import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder

def load_crop_data(filepath=None):
    """Load the genuine 2200-sample crop recommendation dataset."""
    if filepath is None:
      filepath = os.path.join(os.path.dirname(__file__), 'crop_recommendation.csv')
    df = pd.read_csv(filepath)
    df.columns = [c.strip() for c in df.columns]
    return df

def analyze_dataset(df):
    """Perform exploratory data analysis on the dataset."""
    stats = {
        'total_samples': int(len(df)),
        'total_features': int(df.shape[1] - 1),
        'missing_values': df.isnull().sum().to_dict(),
        'feature_summary': df.describe().to_dict(),
        'classes': df['label'].unique().tolist() if 'label' in df.columns else [],
        'num_classes': int(df['label'].nunique()) if 'label' in df.columns else 0,
        'class_distribution': df['label'].value_counts().to_dict() if 'label' in df.columns else {}
    }
    return stats

def prepare_crop_data(df, test_size=0.2, random_state=42):
    """
    Split crop data into train/test sets and fit a StandardScaler.
    Returns: X_train, X_test, y_train, y_test, scaler, feature_names
    """
    feature_cols = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    X = df[feature_cols].copy()
    y = df['label'].copy()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    return (
        X_train, X_test,
        X_train_scaled, X_test_scaled,
        y_train, y_test,
        scaler, feature_cols
    )

def load_fertilizer_prediction_data(filepath=None):
    """Load the fertilizer prediction dataset."""
    if filepath is None:
        filepath = os.path.join(os.path.dirname(__file__), 'datasets', 'fertilizer_prediction.csv')
    df = pd.read_csv(filepath)
    df.columns = [c.strip() for c in df.columns]
    return df

def load_crop_nutrient_requirements(filepath=None):
    """Load the crop nutrient baseline reference table."""
    if filepath is None:
        filepath = os.path.join(os.path.dirname(__file__), 'datasets', 'fertilizer_requirements.csv')
    df = pd.read_csv(filepath)
    df.columns = [c.strip() for c in df.columns]
    if 'Unnamed: 0' in df.columns:
        df = df.drop(columns=['Unnamed: 0'])
    df['Crop'] = df['Crop'].str.strip().str.lower()
    return df
