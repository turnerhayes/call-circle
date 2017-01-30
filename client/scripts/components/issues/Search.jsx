import _ from "lodash";
import $ from "jquery";
import React from "react";
import { Link, browserHistory } from "react-router";
import IssueUtils from "../../utils/issue";
import Categories from "../../../../server/persistence/categories";
import "search.less";

class SearchResult extends React.Component {
	render() {
		return (
			<li className="search-result">
				<Link
					className={`fa fa-${IssueUtils.CATEGORY_ICON_MAP[this.props.result.category]}`}
					to={`/issues/${this.props.result.id}`}
				>{this.props.result.name}</Link>
			</li>
		);
	}
}

export default class IssueSearch extends React.Component {
	state = {
		searchResults: []
	}

	componentDidMount() {
		if (this.props.search) {
			this.performSearch();
		}
	}

	performSearch(options = {}) {
		const formData = this.$form.serializeArray().reduce(
			(data, field) => {
				if (!(field.name in data)) {
					data[field.name] = field.value;
				}
				else if (!_.isArray(data[field.name])) {
					data[field.name] = [data[field.name], field.value];
				}
				else {
					data[field.name].push(field.value);
				}

				return data;
			},
			{}
		);

		if (options.pushState) {
			browserHistory.push(`/issues/search?${this.$form.serialize()}`);
		}

		IssueUtils.searchIssues(formData).then(
			issues => this.setState({searchResults: issues})
		);
	}

	handleFormSubmit(event) {
		event.preventDefault();

		this.performSearch({
			pushState: true
		});
	}

	render() {
		return (
			<div className="issues-search-container">
				<form
					action="/issues/search"
					method="get"
					encType="application/x-www-form-urlencoded"
					onSubmit={event => this.handleFormSubmit(event)}
					ref={form => this.$form = $(form)}
				>
					<div
						className="form-inline"
					>
						<label
							htmlFor="search-query"
							className="sr-only"
						>Search query</label>
						<input
							type="search"
							name="query"
							id="search-query"
							className="form-control"
							defaultValue={this.props.search.query}
						/>
					</div>
					<div
						className="form-inline"
					>
						<label
							htmlFor="search-category"
							className="sr-only"
						>
							Category
						</label>
						<select
							id="search-category"
							name="category"
							defaultValue={
								_.isUndefined(this.props.search.category) ?
									undefined :
									_.castArray(this.props.search.category)
							}
							multiple
						>
							{
								_.map(
									Categories,
									(category, categoryID) => (
										<option
											key={categoryID}
											value={categoryID}
										>{category.name}</option>
									)
								)
							}
						</select>
					</div>

					<button
						type="submit"
						className="btn btn-primary"
					>Search</button>
				</form>
				<div>
					{
						this.state.searchResults.length > 0 ?
							<h3>Results</h3> :
							""
					}
					<ul className="search-results">
						{
							this.state.searchResults.map(
								result => <SearchResult key={result.id} result={result} />
							)
						}
					</ul>
				</div>
			</div>
		);
	}
}
