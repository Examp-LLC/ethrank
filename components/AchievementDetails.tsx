/*
 * All content copyright 2023 Examp, LLC
 *
 * This file is part of ETHRank.
 * 
 * ETHRank is free software: you can redistribute 
 * it and/or modify it under the terms of the GNU General Public 
 * License as published by the Free Software Foundation, either 
 * version 3 of the License, or (at your option) any later version.
 * 
 * ETHRank is distributed in the hope that it will 
 * be useful, but WITHOUT ANY WARRANTY; without even the implied warranty 
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
*/

import styles from '../styles/Address.module.scss';
import { StepType } from '../lib/Achievement.interface';
import { useState } from 'react';

type DetailValue = string | number | undefined;

export interface DetailAchievement {
  name: string;
  points: number;
  slug: string;
  goals: DetailGoal[];
}

export interface DetailGoal {
  name: string;
  category: string;
  slug: string;
  points: number;
  steps: DetailStep[];
}

export interface DetailStep {
  name: string;
  points: number;
  type: string;
  params: {
    count?: string | number;
    amount?: string | number;
    address?: string | string[];
  };
  url?: string;
}

export const normalizeList = (value: DetailValue | DetailValue[]): DetailValue[] => {
  if (Array.isArray(value)) return value;
  if (value === undefined) return [];
  return [value];
}

export const getGoalStepCount = (goal: DetailGoal): number => goal.steps.length;

export const getAchievementStepCount = (achievement: DetailAchievement): number => {
  return achievement.goals.reduce((sum, goal) => sum + getGoalStepCount(goal), 0);
}

export const getAchievementCategories = (achievement: DetailAchievement): string[] => {
  return achievement.goals.reduce((categories: string[], goal) => {
    if (goal.category && categories.indexOf(goal.category) === -1) {
      categories.push(goal.category);
    }

    return categories;
  }, []);
}

export const getStepAddresses = (step: DetailStep): string[] => {
  return normalizeList(step.params.address).filter((address): address is string => typeof address === 'string');
}

export const getAddressCount = (goal: DetailGoal): number => {
  return goal.steps.reduce((sum, step) => sum + getStepAddresses(step).length, 0);
}

const pluralize = (count: number | string | undefined, singular: string, plural: string): string => {
  return Number(count) === 1 ? singular : plural;
}

const formatStepType = (type: string): string => {
  switch (type) {
    case StepType.DeployContractCount:
      return 'Contract deployment';
    case StepType.MineBlocksCount:
      return 'Block mining';
    case StepType.OwnPoapCount:
      return 'POAP ownership';
    case StepType.OwnTokenByAddress:
      return 'Token ownership by contract';
    case StepType.OwnTokenCount:
      return 'Token collection count';
    case StepType.SendEthAmount:
      return 'ETH transfer amount';
    case StepType.SpendGasAmount:
      return 'Gas spend';
    case StepType.TransactionFromAddressCount:
      return 'Transactions received';
    case StepType.TransactionToAddressCount:
      return 'Transactions sent';
    default:
      return type.replace(/_/g, ' ');
  }
}

export const getStepRequirement = (step: DetailStep): string => {
  const { count, amount } = step.params;
  const addressCount = getStepAddresses(step).length;
  const hasTargetAddresses = addressCount > 0;

  switch (step.type) {
    case StepType.DeployContractCount:
      return `Deploy at least ${count} ${pluralize(count, 'contract', 'contracts')}.`;
    case StepType.MineBlocksCount:
      return `Mine at least ${count} ${pluralize(count, 'block', 'blocks')}.`;
    case StepType.OwnPoapCount:
      return `Hold at least ${count} ${pluralize(count, 'POAP', 'POAPs')}.`;
    case StepType.OwnTokenByAddress:
      return hasTargetAddresses
        ? `Hold at least ${count} token/NFT from the eligible contract ${pluralize(addressCount, 'address', 'addresses')} below.`
        : `Hold at least ${count} token/NFT.`;
    case StepType.OwnTokenCount:
      return `Hold at least ${count} distinct ERC-20, ERC-721, or ERC-1155 token ${pluralize(count, 'contract', 'contracts')}.`;
    case StepType.SendEthAmount:
      return `Send at least ${amount} ETH in a single transaction.`;
    case StepType.SpendGasAmount:
      return `Spend at least ${amount} ETH on gas.`;
    case StepType.TransactionFromAddressCount:
      return hasTargetAddresses
        ? `Receive at least ${count} ${pluralize(count, 'transaction', 'transactions')} from one of the eligible addresses below.`
        : `Receive ETH from at least ${count} unique ${pluralize(count, 'address', 'addresses')}.`;
    case StepType.TransactionToAddressCount:
      return hasTargetAddresses
        ? `Send at least ${count} ${pluralize(count, 'transaction', 'transactions')} to one of the eligible addresses below.`
        : `Send ETH to at least ${count} unique ${pluralize(count, 'address', 'addresses')}.`;
    default:
      return hasTargetAddresses
        ? `Complete the requirement using one of the eligible addresses below.`
        : `Complete the requirement shown in this step.`;
  }
}

interface DetailMetricProps {
  label: string;
  value: string | number;
}

export const DetailMetric = ({ label, value }: DetailMetricProps) => (
  <div className={styles.detailMetric}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
)

interface DetailTagsProps {
  tags: string[];
}

export const DetailTags = ({ tags }: DetailTagsProps) => {
  if (!tags.length) return null;

  return (
    <div className={styles.detailTags}>
      {tags.map((tag) => (
        <span className={styles.detailTag} key={tag}>{tag}</span>
      ))}
    </div>
  )
}

interface StepDetailsProps {
  step: DetailStep;
}

const CopyIcon = () => (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
    <path d="M8 8h11v11H8z" />
    <path d="M5 16H4V4h12v1" />
  </svg>
)

const CheckIcon = () => (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
    <path d="m5 12 4 4L19 6" />
  </svg>
)

const ExternalLinkIcon = () => (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
    <path d="M14 5h5v5" />
    <path d="m10 14 9-9" />
    <path d="M19 14v5H5V5h5" />
  </svg>
)

interface AddressRowProps {
  address: string;
}

const AddressRow = ({ address }: AddressRowProps) => {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = address;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  const copyLabel = copied ? 'Copied address' : 'Copy address';

  return (
    <div className={styles.addressItem}>
      <code>{address}</code>
      <div className={styles.addressActions}>
        <button
          type="button"
          className={`${styles.addressIconButton} ${copied ? styles.copied : ''}`}
          aria-label={copyLabel}
          title={copyLabel}
          onClick={copyAddress}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
        <a
          className={styles.addressIconButton}
          href={`https://blockscan.com/address/${address}`}
          target="_blank"
          rel="noreferrer"
          aria-label={`Verify ${address}`}
          title="Verify address"
        >
          <ExternalLinkIcon />
        </a>
      </div>
    </div>
  )
}

export const StepDetails = ({ step }: StepDetailsProps) => {
  const addresses = getStepAddresses(step);

  return (
    <div className={styles.stepDetails}>
      <p>{getStepRequirement(step)}</p>
      <div className={styles.cardMeta}>
        <span>{formatStepType(step.type)}</span>
        <span>{step.points} points</span>
        {step.params.count !== undefined && <span>Minimum count: {step.params.count}</span>}
        {step.params.amount !== undefined && <span>Minimum amount: {step.params.amount} ETH</span>}
      </div>

      {addresses.length > 0 && (
        <div className={styles.addressList}>
          <span className={styles.addressListLabel}>Eligible address{addresses.length === 1 ? '' : 'es'}</span>
          {addresses.map((address) => (
            <AddressRow address={address} key={address} />
          ))}
        </div>
      )}

      {step.url && (
        <a className={styles.sourceLink} href={step.url} target="_blank" rel="noreferrer">
          Project or reference link
        </a>
      )}
    </div>
  )
}
